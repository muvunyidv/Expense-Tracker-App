import {
    LayoutDashboard,
    PlusCircle,
    Tags,
    ChevronRight,
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
    {
      title: "Add New Expense",
      icon: PlusCircle,
      url: "#add-expense",
    },
  ];
  
  export function AppSidebar() {
    return (
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Expense Tracker</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }
  