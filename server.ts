import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import crypto from "crypto";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, updateDoc, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Middleware
app.use(express.json());
app.use(cors());

// Meta Credentials
const META_APP_SECRET = process.env.META_APP_SECRET;
const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
const META_PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN;
const META_PAGE_ID = process.env.META_PAGE_ID;

// --- Meta API Helpers ---

const sendMetaMessage = async (psid: string, text: string) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/me/messages?access_token=${META_PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: psid },
        message: { text },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Meta Send API Error:", error.response?.data || error.message);
    throw error;
  }
};

// --- Webhook Endpoints ---

// Verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === META_VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Reception
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;

      if (webhook_event.message) {
        const text = webhook_event.message.text;
        const mid = webhook_event.message.mid;

        // 1. Update Customer
        const customerRef = doc(db, "customers", sender_psid);
        const customerSnap = await getDoc(customerRef);
        
        if (!customerSnap.exists()) {
          // New customer - try to fetch name from Meta
          let name = "Unknown Customer";
          try {
            const userProfile = await axios.get(
              `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name&access_token=${META_PAGE_ACCESS_TOKEN}`
            );
            name = `${userProfile.data.first_name} ${userProfile.data.last_name}`;
          } catch (e) {
            console.error("Error fetching user profile:", e);
          }

          await setDoc(customerRef, {
            psid: sender_psid,
            name,
            lastInteraction: new Date().toISOString(),
            tags: [],
            notes: "",
            optIn: true
          });
        } else {
          await updateDoc(customerRef, {
            lastInteraction: new Date().toISOString()
          });
        }

        // 2. Save Message
        const messageRef = doc(db, "conversations", sender_psid, "messages", mid);
        await setDoc(messageRef, {
          mid,
          text,
          senderId: sender_psid,
          recipientId: META_PAGE_ID || "page",
          timestamp: new Date().toISOString(),
          type: "inbound",
          status: "received"
        });
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// --- API Endpoints ---

// Get Conversations (Customers)
app.get("/api/conversations", async (req, res) => {
  try {
    const q = query(collection(db, "customers"), orderBy("lastInteraction", "desc"));
    const snap = await getDocs(q);
    const customers = snap.docs.map(doc => doc.data());
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get Messages for a PSID
app.get("/api/conversations/:psid", async (req, res) => {
  try {
    const { psid } = req.params;
    const q = query(collection(db, "conversations", psid, "messages"), orderBy("timestamp", "asc"));
    const snap = await getDocs(q);
    const messages = snap.docs.map(doc => doc.data());
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send Message
app.post("/api/messages/send", async (req, res) => {
  const { psid, text } = req.body;
  if (!psid || !text) return res.status(400).json({ error: "Missing psid or text" });

  try {
    // Check 24h window
    const customerRef = doc(db, "customers", psid);
    const customerSnap = await getDoc(customerRef);
    if (!customerSnap.exists()) return res.status(404).json({ error: "Customer not found" });

    const lastInteraction = new Date(customerSnap.data().lastInteraction);
    const now = new Date();
    const diffHours = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);

    if (diffHours > 24) {
      return res.status(403).json({ error: "Outside 24-hour window. Cannot send standard message." });
    }

    const metaResult = await sendMetaMessage(psid, text);
    const mid = metaResult.message_id;

    // Save outbound message
    const messageRef = doc(db, "conversations", psid, "messages", mid);
    await setDoc(messageRef, {
      mid,
      text,
      senderId: META_PAGE_ID || "page",
      recipientId: psid,
      timestamp: new Date().toISOString(),
      type: "outbound",
      status: "sent"
    });

    res.json({ success: true, mid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Campaigns
app.get("/api/campaigns", async (req, res) => {
  const snap = await getDocs(query(collection(db, "campaigns"), orderBy("createdAt", "desc")));
  res.json(snap.docs.map(doc => doc.data()));
});

app.post("/api/campaigns", async (req, res) => {
  const { name, content, targetSegment } = req.body;
  const id = crypto.randomUUID();
  const campaign = {
    id,
    name,
    content,
    status: "draft",
    targetSegment: targetSegment || {},
    totalRecipients: 0,
    sentCount: 0,
    failedCount: 0,
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, "campaigns", id), campaign);
  res.json(campaign);
});

// Start Campaign (Compliance Engine)
app.post("/api/campaigns/:id/start", async (req, res) => {
  const { id } = req.params;
  const campaignRef = doc(db, "campaigns", id);
  const campaignSnap = await getDoc(campaignRef);
  if (!campaignSnap.exists()) return res.status(404).json({ error: "Campaign not found" });

  const campaign = campaignSnap.data();
  await updateDoc(campaignRef, { status: "running" });

  // 1. Filter compliant customers
  const customersSnap = await getDocs(collection(db, "customers"));
  const now = new Date();
  const compliantCustomers = customersSnap.docs.filter(doc => {
    const data = doc.data();
    const lastInteraction = new Date(data.lastInteraction);
    const diffHours = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24; // Simple 24h rule for now
  });

  await updateDoc(campaignRef, { totalRecipients: compliantCustomers.length });

  // 2. Start sending (Background process simulation)
  (async () => {
    let sent = 0;
    let failed = 0;

    for (const customerDoc of compliantCustomers) {
      const psid = customerDoc.id;
      const recipientRef = doc(db, "campaigns", id, "recipients", psid);
      
      try {
        await sendMetaMessage(psid, campaign.content);
        await setDoc(recipientRef, {
          psid,
          status: "sent",
          sentAt: new Date().toISOString()
        });
        sent++;
      } catch (e: any) {
        await setDoc(recipientRef, {
          psid,
          status: "failed",
          error: e.message
        });
        failed++;
      }

      await updateDoc(campaignRef, { sentCount: sent, failedCount: failed });
    }

    await updateDoc(campaignRef, { status: "completed" });
  })();

  res.json({ success: true, message: "Campaign started" });
});

// Templates
app.get("/api/templates", async (req, res) => {
  const snap = await getDocs(collection(db, "templates"));
  res.json(snap.docs.map(doc => doc.data()));
});

app.post("/api/templates", async (req, res) => {
  const { name, content } = req.body;
  const id = crypto.randomUUID();
  const template = { id, name, content, createdAt: new Date().toISOString() };
  await setDoc(doc(db, "templates", id), template);
  res.json(template);
});

// Customer Updates
app.patch("/api/customers/:psid/tags", async (req, res) => {
  const { psid } = req.params;
  const { tags } = req.body;
  await updateDoc(doc(db, "customers", psid), { tags });
  res.json({ success: true });
});

app.post("/api/customers/:psid/notes", async (req, res) => {
  const { psid } = req.params;
  const { notes } = req.body;
  await updateDoc(doc(db, "customers", psid), { notes });
  res.json({ success: true });
});

// --- Vite Middleware ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
