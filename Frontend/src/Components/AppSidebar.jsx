import { useEffect, useState } from "react";
import { LayoutDashboard, Tags, Wallet, ClipboardList, Users, Copy, Check, UserCircle, ShieldCheck } from "lucide-react";
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
  { title: "Plans", icon: ClipboardList, url: "#plans" },
];

export function AppSidebar({ total = 0, user = {} }) {
  const [activeHash, setActiveHash] = useState(() => window.location.hash || "#summary");
  const [copied, setCopied] = useState(false);
  const { isMobile, setOpen } = useSidebar();

  useEffect(() => {
    const onHashChange = () => setActiveHash(window.location.hash || "#summary");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
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

  return (
    <Sidebar className="border-r border-zinc-200 bg-white">
      <SidebarContent className="justify-between h-full bg-white">
        <div className="flex flex-col h-full">
          <SidebarGroup className="pt-8">
            <SidebarGroupLabel className="text-zinc-900 font-black mb-8 px-2 tracking-tighter text-xl italic">
              EXPENSE<span className="text-orange-500">.</span>TRK
            </SidebarGroupLabel>

            {/* IDENTITY CARD - Consistent Orange Theme */}
            <div className="px-2 mb-8">
              <div className="flex items-center gap-3 p-3 rounded-2xl border border-orange-100 bg-orange-50/50 transition-all">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-lg bg-orange-500 shadow-orange-200">
                  {isManager ? <ShieldCheck className="w-6 h-6" /> : <UserCircle className="w-6 h-6" />}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black text-zinc-900 truncate uppercase tracking-tight">
                    {user?.username || "Guest User"}
                  </p>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-orange-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                      {user?.role || "Staff"}
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
            {/* RECRUIT STAFF - Orange Branding */}
            {isManager && user?.inviteCode && (
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 shadow-lg shadow-orange-100 animate-in slide-in-from-left duration-500">
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
                <p className="text-[9px] text-orange-200 font-bold mt-2 uppercase text-center tracking-tighter">Share code to sync group data</p>
              </div>
            )}

            {/* TOTAL WIDGET - Updated to Orange Branding */}
            <div className="relative overflow-hidden rounded-2xl p-5 shadow-xl bg-orange-600 shadow-orange-500/30 active:scale-95 transition-all">
              <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-white/10 blur-xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-white/20">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">
                    {isManager ? "Organization Total" : "My Total Expenses"}
                  </span>
                </div>
                
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white tracking-tight">
                    {total.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-white/50 uppercase">Rwf</span>
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
             <div className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
             <p className="text-sm font-black text-zinc-900 uppercase tracking-tighter">
               EXPENSE<span className="text-orange-500">.</span>TRK
             </p>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            © {currentYear} • GROUP FINANCIAL MANAGEMENT
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