import { useEffect, useState } from "react";
import { LayoutDashboard, PlusCircle, Tags } from "lucide-react";
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
  
export function AppSidebar() {
  const [activeHash, setActiveHash] = useState(() => window.location.hash || "#summary");

  useEffect(() => {
    const onHashChange = () => setActiveHash(window.location.hash || "#summary");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <Sidebar>
      <SidebarContent>
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
      </SidebarContent>
    </Sidebar>
  );
}
  