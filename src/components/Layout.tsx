import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Send, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Inbox", path: "/inbox", icon: MessageSquare },
  { name: "Campaigns", path: "/campaigns", icon: Send },
  { name: "Templates", path: "/templates", icon: FileText },
  { name: "Customers", path: "/customers", icon: Users },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "bg-zinc-900 border-r border-zinc-800 transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold tracking-tight text-white italic serif">CRM Messenger</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-zinc-800 rounded">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center p-3 rounded-lg transition-colors",
                location.pathname === item.path 
                  ? "bg-zinc-100 text-zinc-900 font-medium" 
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              )}
            >
              <item.icon size={20} className={cn(sidebarOpen ? "mr-3" : "mx-auto")} />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full p-3 text-zinc-400 hover:bg-zinc-800 hover:text-red-400 rounded-lg transition-colors"
          >
            <LogOut size={20} className={cn(sidebarOpen ? "mr-3" : "mx-auto")} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <header className="h-16 border-b border-zinc-800 flex items-center px-8 bg-zinc-900/50 backdrop-blur-md">
          <div className="flex-1">
            <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest">
              {navItems.find(i => i.path === location.pathname)?.name || "Messenger CRM"}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">{auth.currentUser?.displayName || "Admin"}</p>
              <p className="text-xs text-zinc-500">{auth.currentUser?.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center border border-zinc-600">
              <Settings size={16} />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
