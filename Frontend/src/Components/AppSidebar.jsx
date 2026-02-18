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

// Added total prop to the sidebar
export function AppSidebar({ total = 0 }) {
  const [activeHash, setActiveHash] = useState(() => window.location.hash || "#summary");

  useEffect(() => {
    const onHashChange = () => setActiveHash(window.location.hash || "#summary");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <Sidebar>
      {/* justify-between pushes the Total Card to the bottom */}
      <SidebarContent className="justify-between">
        <div>
          <SidebarGroup>
            <SidebarGroupLabel className="text-black">Expense Tracker</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const isActive = activeHash === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild active={isActive}>
                        <a href={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* PERSISTENT TOTAL CARD */}
        <SidebarGroup className="mt-auto mb-4 px-4">
          <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-orange-600 dark:text-orange-400">
              <Wallet className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Total Spent</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-zinc-900 dark:text-white truncate">
                {total.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-orange-500/80 uppercase">Rwf</span>
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-6 px-8 border-t border-gray-200/60 dark:border-zinc-700/60 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            © {currentYear} <span className="text-black dark:text-white">Expense Tracker.</span> All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <a href="#" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-orange-500 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-orange-500 transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-orange-500 transition-colors">
            Help Center
          </a>
        </div>
      </div>
    </footer>
  );
}