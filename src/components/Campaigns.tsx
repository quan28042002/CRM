import { useEffect, useState } from "react";
import { 
  Plus, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Play,
  Eye,
  Trash2,
  Users
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import axios from "axios";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: "", content: "" });
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get("/api/campaigns");
      setCampaigns(res.data);
    } catch (e) {
      toast.error("Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/campaigns", newCampaign);
      setShowCreate(false);
      setNewCampaign({ name: "", content: "" });
      fetchCampaigns();
      toast.success("Campaign created as draft");
    } catch (e) {
      toast.error("Failed to create campaign");
    }
  };

  const handleStart = async (id: string) => {
    setStarting(id);
    try {
      await axios.post(`/api/campaigns/${id}/start`);
      toast.success("Campaign started successfully");
      fetchCampaigns();
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Failed to start campaign");
    } finally {
      setStarting(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">Campaigns</h1>
          <p className="text-zinc-500 italic serif">Manage your broadcast campaigns following Meta policies.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-zinc-100 text-zinc-900 rounded-2xl font-bold hover:bg-white transition-all"
        >
          <Plus size={20} />
          <span>New Campaign</span>
        </button>
      </header>

      {showCreate && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6"
        >
          <h3 className="text-xl font-bold italic serif">Create New Campaign</h3>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Campaign Name</label>
              <input 
                type="text" 
                required
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder="e.g., Summer Sale 2024"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-6 text-sm focus:outline-none focus:border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Message Content</label>
              <textarea 
                required
                value={newCampaign.content}
                onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                placeholder="Type your message here..."
                className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-sm focus:outline-none focus:border-zinc-700 resize-none"
              ></textarea>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center space-x-4">
              <AlertCircle size={20} className="text-amber-500" />
              <p className="text-xs text-amber-500/70 leading-relaxed">
                This campaign will only be sent to users who have interacted with your page in the last 24 hours.
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <button 
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-6 py-3 text-zinc-400 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-8 py-3 bg-zinc-100 text-zinc-900 rounded-2xl font-bold hover:bg-white transition-all"
              >
                Create Draft
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : campaigns.length > 0 ? (
          campaigns.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 hover:border-zinc-700 transition-all"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-bold">{c.name}</h3>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest",
                    c.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    c.status === "running" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                    "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  )}>
                    {c.status}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 line-clamp-2 italic serif">"{c.content}"</p>
                <div className="flex items-center space-x-4 pt-2">
                  <div className="flex items-center space-x-1 text-xs text-zinc-500">
                    <Clock size={14} />
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-zinc-500">
                    <Users size={14} />
                    <span>{c.totalRecipients || 0} Recipients</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-8 px-8 border-x border-zinc-800">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{c.sentCount || 0}</p>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Sent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{c.failedCount || 0}</p>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Failed</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {c.status === "draft" && (
                  <button 
                    onClick={() => handleStart(c.id)}
                    disabled={starting === c.id}
                    className="p-4 bg-zinc-100 text-zinc-900 rounded-2xl hover:bg-white transition-all disabled:opacity-50"
                  >
                    {starting === c.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-zinc-900"></div>
                    ) : (
                      <Play size={20} />
                    )}
                  </button>
                )}
                <button className="p-4 bg-zinc-800 text-zinc-400 rounded-2xl hover:text-white transition-all">
                  <Eye size={20} />
                </button>
                <button className="p-4 bg-zinc-800 text-zinc-400 rounded-2xl hover:text-red-400 transition-all">
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-20 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-3xl flex flex-col items-center justify-center space-y-4">
            <Send size={48} className="text-zinc-700" />
            <p className="text-zinc-500 italic serif">No campaigns created yet. Start your first broadcast!</p>
          </div>
        )}
      </div>
    </div>
  );
}
