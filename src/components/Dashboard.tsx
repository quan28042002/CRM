import { useEffect, useState } from "react";
import { 
  Users, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock 
} from "lucide-react";
import { motion } from "motion/react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

const stats = [
  { name: "New Conversations", value: "12", icon: MessageSquare, color: "text-blue-400" },
  { name: "Total Sent", value: "1,234", icon: Send, color: "text-emerald-400" },
  { name: "Success Rate", value: "98.5%", icon: CheckCircle, color: "text-indigo-400" },
  { name: "Active (24h Window)", value: "45", icon: Clock, color: "text-amber-400" },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(5));
        const snap = await getDocs(q);
        setData(snap.docs.map(doc => doc.data()));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-white">Overview</h1>
        <p className="text-zinc-500">Real-time statistics and recent activity.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col space-y-4 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <stat.icon className={stat.color} size={24} />
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Live</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-zinc-500">{stat.name}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold italic serif">Recent Activity</h3>
            <button className="text-xs font-mono text-zinc-500 hover:text-white uppercase tracking-widest">View All</button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : data.length > 0 ? (
              data.map((log, i) => (
                <div key={i} className="flex items-center p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl space-x-4">
                  <div className="p-2 bg-zinc-800 rounded-lg">
                    <AlertCircle size={16} className="text-zinc-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-zinc-500">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-zinc-500">{log.performedBy}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-zinc-500 p-8 italic">No recent activity found.</p>
            )}
          </div>
        </div>

        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6">
          <h3 className="text-xl font-bold italic serif">Compliance Status</h3>
          <div className="space-y-6">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-emerald-500 rounded-full">
                <CheckCircle size={20} className="text-zinc-900" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-400">Policy Compliant</p>
                <p className="text-xs text-emerald-500/70">All broadcasts are within 24h window.</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-zinc-500 uppercase tracking-widest">
                <span>Daily Limit</span>
                <span>45%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[45%] rounded-full"></div>
              </div>
            </div>

            <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl">
              <p className="text-xs text-zinc-500 leading-relaxed">
                Remember to only send messages to users who have interacted with your page in the last 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
