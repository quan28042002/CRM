import { useEffect, useState } from "react";
import { 
  Search, 
  User, 
  Tag, 
  Clock, 
  MoreVertical, 
  Download,
  Filter,
  CheckCircle,
  XCircle
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import axios from "axios";

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("/api/conversations");
      setCustomers(res.data);
    } catch (e) {
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.psid.includes(searchTerm)
  );

  const handleExport = () => {
    const csv = [
      ["PSID", "Name", "Last Interaction", "Tags", "Opt-In"],
      ...filteredCustomers.map(c => [
        c.psid,
        c.name,
        c.lastInteraction,
        c.tags.join(";"),
        c.optIn ? "Yes" : "No"
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "customers.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Exported successfully");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">Customers</h1>
          <p className="text-zinc-500 italic serif">Manage your Messenger audience and PSIDs.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 px-6 py-3 bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-2xl font-bold hover:bg-zinc-700 transition-all"
          >
            <Download size={20} />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or PSID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-zinc-700"
            />
          </div>
          <button className="p-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-zinc-400 hover:text-white transition-all">
            <Filter size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="py-4 px-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">Customer</th>
                <th className="py-4 px-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">PSID</th>
                <th className="py-4 px-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">Last Interaction</th>
                <th className="py-4 px-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="py-4 px-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">Tags</th>
                <th className="py-4 px-4 text-xs font-mono text-zinc-500 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((c, i) => {
                  const diffHours = (new Date().getTime() - new Date(c.lastInteraction).getTime()) / (1000 * 60 * 60);
                  const isCompliant = diffHours <= 24;

                  return (
                    <motion.tr 
                      key={c.psid}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                            <User size={16} className="text-zinc-400" />
                          </div>
                          <span className="font-medium text-sm">{c.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-mono text-zinc-500">{c.psid}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2 text-xs text-zinc-400">
                          <Clock size={14} />
                          <span>{new Date(c.lastInteraction).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className={cn(
                          "inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest",
                          isCompliant ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                        )}>
                          {isCompliant ? <CheckCircle size={10} /> : <XCircle size={10} />}
                          <span>{isCompliant ? "Compliant" : "Expired"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {c.tags.map((t: string) => (
                            <span key={t} className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-md text-[10px] text-zinc-400">{t}</span>
                          ))}
                          {c.tags.length === 0 && <span className="text-[10px] text-zinc-600 italic">None</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="p-2 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 italic serif">
                    No customers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
