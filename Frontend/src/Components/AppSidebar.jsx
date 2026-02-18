import { useEffect, useState } from "react";
import { LayoutDashboard, Tags, Wallet } from "lucide-react";
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
  {
    title: "Summary",
    icon: LayoutDashboard,
    url: "#summary",
  },
  {
    title: "Categories",
    icon: Tags,
    url: "#categories",
  },
];

export function AppSidebar({ total = 0 }) {
  const [activeHash, setActiveHash] = useState(() => window.location.hash || "#summary");
  const { isMobile, setOpen } = useSidebar();

  useEffect(() => {
    const onHashChange = () => setActiveHash(window.location.hash || "#summary");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Helper to close sidebar after clicking a link on mobile
  const handleNavigation = () => {
    if (isMobile) setOpen(false);
  };

  return (
    <Sidebar className="border-gray-300">
      <SidebarContent className="justify-between">
        <div>
          <SidebarGroup className="pt-6">
            <SidebarGroupLabel className="text-zinc-900 dark:text-black font-bold mb-4 px-2">
              EXPENSE TRACKER
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const isActive = activeHash === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        active={isActive}
                        onClick={handleNavigation}
                      >
                        <a href={item.url} className="flex items-center gap-3">
                          <item.icon className={`w-4 h-4 ${isActive ? 'text-orange-500' : ''}`} />
                          <span className="font-medium">{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* POLISHED TOTAL BALANCE WIDGET */}
        <div className="px-4 mb-8">
          <div className="relative overflow-hidden bg-orange-600 rounded-2xl p-5 shadow-lg transition-transform active:scale-95">
            {/* Subtle decorative glow */}
            <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-white/10 blur-xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">
                  Total Balance
                </span>
              </div>
              
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white tracking-tight">
                  {total.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-white/60 uppercase">
                  Rwf
                </span>
              </div>
              
              {/* Decorative progress detail */}
              <div className="mt-4 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/60 w-1/2 rounded-full" />
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
   <footer className="mt-auto py-8 px-6 border-t border-gray-300  bg-card dark:bg-muted/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-orange-500" />
             <p className="text-sm font-bold text-backround dark:text-black uppercase tracking-tight">
             Expense Tracker
             </p>
          </div>
          <p className="text-xs text-zinc-500">
            © {currentYear} All rights reserved. Created for financial clarity.
          </p>
        </div>

        <div className="flex items-center gap-8">
          <a href="#" className="text-xs font-bold text-zinc-500 hover:text-orange-500 uppercase tracking-widest transition-colors">
            Privacy
          </a>
          <a href="#" className="text-xs font-bold text-zinc-500 hover:text-orange-500 uppercase tracking-widest transition-colors">
            Terms
          </a>
          <a href="#" className="text-xs font-bold text-zinc-500 hover:text-orange-500 uppercase tracking-widest transition-colors">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}