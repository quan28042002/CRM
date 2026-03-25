import { useEffect, useState, useRef } from "react";
import { 
  Search, 
  Send, 
  User, 
  Tag, 
  FileText, 
  Clock,
  AlertCircle,
  CheckCircle2,
  MessageSquare
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import axios from "axios";

export default function Inbox() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedPsid, setSelectedPsid] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedPsid) {
      fetchMessages(selectedPsid);
      const interval = setInterval(() => fetchMessages(selectedPsid), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedPsid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("/api/conversations");
      setCustomers(res.data);
    } catch (e) {
      toast.error("Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (psid: string) => {
    try {
      const res = await axios.get(`/api/conversations/${psid}`);
      setMessages(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPsid || !inputText.trim() || sending) return;

    setSending(true);
    try {
      await axios.post("/api/messages/send", { psid: selectedPsid, text: inputText });
      setInputText("");
      fetchMessages(selectedPsid);
      toast.success("Message sent");
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const selectedCustomer = customers.find(c => c.psid === selectedPsid);

  return (
    <div className="h-full flex bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
      {/* Sidebar List */}
      <div className="w-80 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-zinc-700"
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : customers.length > 0 ? (
            customers.map((c) => (
              <button
                key={c.psid}
                onClick={() => setSelectedPsid(c.psid)}
                className={cn(
                  "w-full p-4 flex items-center space-x-4 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors text-left",
                  selectedPsid === c.psid && "bg-zinc-800"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center border border-zinc-600">
                  <User size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-medium text-sm truncate">{c.name}</p>
                    <p className="text-[10px] font-mono text-zinc-500">{new Date(c.lastInteraction).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <p className="text-xs text-zinc-500 truncate italic serif">PSID: {c.psid}</p>
                </div>
              </button>
            ))
          ) : (
            <p className="text-center text-zinc-500 p-8 italic">No conversations found.</p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-zinc-950/30">
        {selectedPsid ? (
          <>
            <header className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center border border-zinc-600">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold">{selectedCustomer?.name}</p>
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      (new Date().getTime() - new Date(selectedCustomer?.lastInteraction).getTime()) / (1000 * 60 * 60) <= 24 
                        ? "bg-emerald-500" : "bg-zinc-600"
                    )}></div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                      { (new Date().getTime() - new Date(selectedCustomer?.lastInteraction).getTime()) / (1000 * 60 * 60) <= 24 
                        ? "Within 24h Window" : "Outside 24h Window" }
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400"><Tag size={18} /></button>
                <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400"><FileText size={18} /></button>
              </div>
            </header>

            <div className="flex-1 overflow-auto p-6 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex flex-col max-w-[70%]",
                  m.type === "outbound" ? "ml-auto items-end" : "items-start"
                )}>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm shadow-sm",
                    m.type === "outbound" 
                      ? "bg-zinc-100 text-zinc-900 rounded-tr-none" 
                      : "bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700"
                  )}>
                    {m.text}
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <p className="text-[10px] text-zinc-500 font-mono">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {m.type === "outbound" && (
                      <CheckCircle2 size={10} className="text-zinc-500" />
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center space-x-4">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-6 text-sm focus:outline-none focus:border-zinc-700"
                />
                <button 
                  disabled={sending || !inputText.trim()}
                  className="p-3 bg-zinc-100 text-zinc-900 rounded-2xl hover:bg-white disabled:opacity-50 transition-all"
                >
                  <Send size={20} />
                </button>
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <AlertCircle size={12} className="text-zinc-500" />
                <p className="text-[10px] text-zinc-500 italic serif">
                  Standard messages are only allowed within the 24-hour window.
                </p>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <MessageSquare size={32} />
            </div>
            <p className="italic serif">Select a conversation to start chatting.</p>
          </div>
        )}
      </div>

      {/* Info Panel */}
      {selectedPsid && (
        <div className="w-72 border-l border-zinc-800 p-6 space-y-8 bg-zinc-900/30">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <User size={40} className="text-zinc-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{selectedCustomer?.name}</h3>
              <p className="text-xs text-zinc-500 font-mono">PSID: {selectedPsid}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Tags</h4>
              <button className="text-[10px] text-zinc-400 hover:text-white">Edit</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCustomer?.tags?.length > 0 ? (
                selectedCustomer.tags.map((t: string) => (
                  <span key={t} className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-md text-[10px]">{t}</span>
                ))
              ) : (
                <p className="text-[10px] text-zinc-600 italic">No tags assigned.</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Internal Notes</h4>
            <textarea 
              placeholder="Add notes about this customer..."
              className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs focus:outline-none focus:border-zinc-700 resize-none"
              defaultValue={selectedCustomer?.notes}
            ></textarea>
          </div>

          <div className="pt-4 border-t border-zinc-800 space-y-4">
            <div className="flex items-center space-x-2 text-zinc-500">
              <Clock size={14} />
              <p className="text-[10px] font-mono uppercase tracking-widest">Last Interaction</p>
            </div>
            <p className="text-xs">{new Date(selectedCustomer?.lastInteraction).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
