import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Tags, 
  Wallet, 
  ClipboardList, 
  Users, 
  Copy, 
  Check, 
  UserCircle, 
  ShieldCheck, 
  User, 
  ListTodo,
  Activity
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar, 
} from "./ui/sidebar";

const menuItems = [
  { title: "Summary", icon: LayoutDashboard, url: "#summary" },
  { title: "Categories", icon: Tags, url: "#categories" },
  { title: "Requests", icon: ClipboardList, url: "#plans" }, 
  { title: "Plans", icon: ListTodo, url: "#todos" },         
];

export function AppSidebar({ totals = { summary: 0, plans: 0, todos: { pipeline: 0, completed: 0 } }, user = {} }) {
  const [activeHash, setActiveHash] = useState(() => window.location.hash || "#summary");
  const [copied, setCopied] = useState(false);
  const { isMobile, setOpen } = useSidebar();

  useEffect(() => {
    const onRefresh = () => setActiveHash(window.location.hash || "#summary");
    
    // Listen for URL changes
    window.addEventListener("hashchange", onRefresh);
    // Listen for manual updates from the TodoPage data changes
    window.addEventListener("plansUpdated", onRefresh);

    return () => {
      window.removeEventListener("hashchange", onRefresh);
      window.removeEventListener("plansUpdated", onRefresh);
    };
  }, []);

  const handleNavigation = () => {
    if (isMobile) setOpen(false);
  };

  const handleCopyCode = () => {
    if (user?.inviteCode) {
      navigator.clipboard.writeText(user.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isManager = user?.role === "manager";
  const isPersonalUser = user?.role === "user";

  const getActiveData = () => {
    switch (activeHash) {
      case "#todos":
        return { 
          label: "Active Pipeline", 
          value: totals.todos?.pipeline || 0,
          icon: <Activity className="w-4 h-4 text-white" />
        };
      case "#plans":
        return { 
          label: "Total Requested", 
          value: totals.plans || 0,
          icon: <ClipboardList className="w-4 h-4 text-white" />
        };
      case "#categories":
        return { 
          label: "Category Total", 
          value: totals.summary || 0,
          icon: <Tags className="w-4 h-4 text-white" />
        };
      case "#summary":
      default:
        return { 
          label: isManager ? "Organization Total" : "Total Expenses", 
          value: totals.summary || 0,
          icon: <Wallet className="w-4 h-4 text-white" />
        };
    }
  };

  const { label, value, icon } = getActiveData();

  return (
    <Sidebar className="border-r border-zinc-200 bg-white">
      <SidebarContent className="justify-between h-full bg-white">
        <div className="flex flex-col h-full">
          <SidebarGroup className="pt-8">
            <SidebarGroupLabel className="text-zinc-900 font-black mb-8 px-2 tracking-tighter text-xl italic">
              EXPENSE<span className="text-orange-500">.</span>TRK
            </SidebarGroupLabel>

            {/* IDENTITY CARD */}
            <div className="px-2 mb-8">
              <div className="flex items-center gap-3 p-3 rounded-2xl border border-orange-100 bg-orange-50/50 transition-all">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-lg bg-orange-500 shadow-orange-200">
                  {isManager ? <ShieldCheck className="w-6 h-6" /> : isPersonalUser ? <User className="w-6 h-6" /> : <UserCircle className="w-6 h-6" />}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black text-zinc-900 truncate uppercase tracking-tight">
                    {user?.username || "Guest User"}
                  </p>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-orange-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                      {isPersonalUser ? "Personal Account" : user?.role || "Staff"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {menuItems.map((item) => {
                  const isActive = activeHash === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        active={isActive}
                        onClick={handleNavigation}
                        className={`py-6 rounded-xl transition-all border border-transparent ${
                          isActive 
                            ? "bg-zinc-900 text-white shadow-xl shadow-zinc-200 border-zinc-900" 
                            : "hover:bg-zinc-50 hover:border-zinc-100"
                        }`}
                      >
                        <a href={item.url} className="flex items-center gap-3">
                          <item.icon className={`w-5 h-5 transition-colors ${
                            isActive ? 'text-orange-500' : 'text-zinc-400'
                          }`} />
                          <span className={`font-black uppercase text-[11px] tracking-widest ${
                            isActive ? 'text-white' : 'text-zinc-500'
                          }`}>
                            {item.title}
                          </span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <div className="mt-auto p-4 space-y-4">
            {/* RECRUIT STAFF - MANAGER ONLY */}
            {isManager && user?.inviteCode && (
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 shadow-lg shadow-orange-100">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-3.5 h-3.5 text-orange-100" />
                  <span className="text-[10px] font-black text-orange-100 uppercase tracking-widest">Recruit Staff</span>
                </div>
                <button 
                  onClick={handleCopyCode}
                  className="w-full flex items-center justify-between bg-white/10 border border-white/20 px-3 py-2.5 rounded-xl hover:bg-white/20 transition-all group active:scale-95"
                >
                  <span className="text-sm font-black text-white tracking-widest">{user.inviteCode}</span>
                  {copied ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Copy className="w-4 h-4 text-orange-200 group-hover:text-white" />
                  )}
                </button>
              </div>
            )}

            {/* TOTAL WIDGET - Dynamic based on Page */}
            <div className="relative overflow-hidden rounded-2xl p-5 shadow-xl bg-orange-600 active:scale-95 transition-all">
              <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-white/10 blur-xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-white/20">
                    {icon}
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    {label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white tracking-tight">
                    {Number(value).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-white/60 uppercase">Rwf</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-10 px-6 border-t border-zinc-100 bg-zinc-50/50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-1.5">
          <div className="flex items-center gap-2">
             <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
             <p className="text-sm font-black text-zinc-900 uppercase tracking-tighter">
                EXPENSE<span className="text-orange-500">.</span>TRK
             </p>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            © {currentYear} • PROFESSIONAL FINANCIAL ANALYTICS
          </p>
        </div>

        <div className="flex items-center gap-8">
          {["Privacy", "Terms", "Support"].map((link) => (
            <a key={link} href="#" className="text-[10px] font-black text-zinc-400 hover:text-orange-500 uppercase tracking-[0.2em] transition-all">
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}