import { useEffect, useState } from "react";
import { 
  Plus, 
  FileText, 
  Copy, 
  Trash2, 
  Edit3 
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import axios from "axios";

export default function Templates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", content: "" });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get("/api/templates");
      setTemplates(res.data);
    } catch (e) {
      toast.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/templates", newTemplate);
      setShowCreate(false);
      setNewTemplate({ name: "", content: "" });
      fetchTemplates();
      toast.success("Template saved");
    } catch (e) {
      toast.error("Failed to save template");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">Templates</h1>
          <p className="text-zinc-500 italic serif">Reusable message templates for quick responses.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-zinc-100 text-zinc-900 rounded-2xl font-bold hover:bg-white transition-all"
        >
          <Plus size={20} />
          <span>New Template</span>
        </button>
      </header>

      {showCreate && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6"
        >
          <h3 className="text-xl font-bold italic serif">Create New Template</h3>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Template Name</label>
              <input 
                type="text" 
                required
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="e.g., Welcome Message"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-6 text-sm focus:outline-none focus:border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Content</label>
              <textarea 
                required
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                placeholder="Type your template message here..."
                className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-sm focus:outline-none focus:border-zinc-700 resize-none"
              ></textarea>
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
                Save Template
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="flex justify-center p-12 col-span-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : templates.length > 0 ? (
          templates.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4 hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 bg-zinc-800 rounded-lg">
                  <FileText size={18} className="text-zinc-400" />
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"><Edit3 size={16} /></button>
                  <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-400"><Trash2 size={16} /></button>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg">{t.name}</h3>
                <p className="text-sm text-zinc-500 line-clamp-3 mt-2 italic serif">"{t.content}"</p>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(t.content);
                  toast.success("Copied to clipboard");
                }}
                className="w-full flex items-center justify-center space-x-2 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-mono uppercase tracking-widest transition-all"
              >
                <Copy size={14} />
                <span>Copy Content</span>
              </button>
            </motion.div>
          ))
        ) : (
          <div className="p-20 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-3xl flex flex-col items-center justify-center space-y-4 col-span-full">
            <FileText size={48} className="text-zinc-700" />
            <p className="text-zinc-500 italic serif">No templates found. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
