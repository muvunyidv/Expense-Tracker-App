import { useEffect, useState, useRef } from "react";
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
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle
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

export function Footer() {
  return (
    <footer className="mt-auto py-8 px-6 border-t border-zinc-100 bg-white">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-900">
            EXPENSE<span className="text-orange-500">.</span>TRK
          </span>
          <span className="text-[10px] text-zinc-400 font-bold ml-2">
            © 2026 • PROFESSIONAL FINANCIAL ANALYTICS
          </span>
        </div>
        
        <div className="flex items-center gap-8">
          {["Privacy", "Terms", "Support"].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-orange-500 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function AppSidebar({ totals = {}, user = {} }) {
  const [activeHash, setActiveHash] = useState(() => window.location.hash || "#summary");
  const [activeTab, setActiveTab] = useState("pending"); 
  const [liveTotals, setLiveTotals] = useState(totals);
  const [copied, setCopied] = useState(false);
  const { isMobile, setOpen } = useSidebar();
  
  // Ref to lock state once live data is received to prevent prop-sync flickers
  const hasLiveUpdate = useRef(false);

  useEffect(() => {
    if (!hasLiveUpdate.current) {
      setLiveTotals(totals);
    }
  }, [totals]);

  useEffect(() => {
    const onHashChange = () => {
      setActiveHash(window.location.hash || "#summary");
    };

    const handlePlansUpdate = (e) => {
      if (e.detail?.plansByStatus) {
        hasLiveUpdate.current = true;
        setLiveTotals(prev => ({
          ...prev,
          plansByStatus: e.detail.plansByStatus
        }));
      }
    };

    const handleTabChange = (e) => {
      if (e.detail) setActiveTab(e.detail);
    };
    
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("plansUpdated", handlePlansUpdate);
    window.addEventListener("tabChanged", handleTabChange);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("plansUpdated", handlePlansUpdate);
      window.removeEventListener("tabChanged", handleTabChange);
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
    const hash = activeHash || "#summary";
    
    switch (hash) {
      case "#todos":
        return { 
          label: "Active Pipeline", 
          value: liveTotals.todos?.pipeline || 0,
          icon: <Activity className="w-4 h-4 text-white" />,
          color: "bg-orange-600" 
        };
      case "#plans":
        if (activeTab === "approved") {
          return {
            label: "Approved Requests",
            value: liveTotals.plansByStatus?.approved || 0,
            icon: <CheckCircle2 className="w-4 h-4 text-white" />,
            color: "bg-green-600" 
          };
        } else if (activeTab === "rejected") {
          return {
            label: "Rejected Requests",
            value: liveTotals.plansByStatus?.rejected || 0,
            icon: <AlertCircle className="w-4 h-4 text-white" />,
            color: "bg-red-500"
          };
        } else {
          return {
            label: "Pending Requests",
            value: liveTotals.plansByStatus?.pending || 0,
            icon: <Clock className="w-4 h-4 text-white" />,
            color: "bg-orange-500" 
          };
        }
      case "#categories":
        return { 
          label: "Category Total", 
          value: liveTotals.summary || 0,
          icon: <Tags className="w-4 h-4 text-white" />,
          color: "bg-orange-500"
        };
      case "#summary":
      default:
        return { 
          label: isManager ? "Organization Total" : "Total Expenses", 
          value: liveTotals.summary || 0,
          icon: <Wallet className="w-4 h-4 text-white" />,
          color: "bg-orange-500"
        };
    }
  };

  const { label, value, icon, color } = getActiveData();

  return (
    <Sidebar className="border-r border-zinc-200 bg-white">
      <SidebarContent className="justify-between h-full bg-white">
        <div className="flex flex-col h-full">
          <SidebarGroup className="pt-8">
            <SidebarGroupLabel className="text-zinc-900 font-black mb-8 px-2 tracking-tighter text-xl italic">
              EXPENSE<span className="text-orange-500">.</span>TRK
            </SidebarGroupLabel>

            <div className="px-2 mb-8">
              <div className="flex items-center gap-3 p-3 rounded-2xl border border-orange-100 bg-orange-50/50">
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
                        className={`py-6 rounded-xl transition-all border ${
                          isActive 
                            ? "bg-zinc-100 text-zinc-900 shadow-sm border-zinc-200" 
                            : "hover:bg-zinc-50 hover:border-zinc-100 border-transparent text-zinc-500"
                        }`}
                      >
                        <a href={item.url} className="flex items-center gap-3">
                          <item.icon className={`w-5 h-5 transition-colors ${
                            isActive ? 'text-orange-500' : 'text-zinc-400'
                          }`} />
                          <span className={`font-black uppercase text-[11px] tracking-widest ${
                            isActive ? 'text-zinc-900' : 'text-zinc-500'
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
                  {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-orange-200 group-hover:text-white" />}
                </button>
              </div>
            )}

            <div className={`relative overflow-hidden rounded-2xl p-5 shadow-xl transition-all duration-500 ${color} active:scale-95`}>
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
