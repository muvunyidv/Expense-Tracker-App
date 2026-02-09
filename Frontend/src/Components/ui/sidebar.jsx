import { createContext, useContext, useState } from "react";

const SidebarContext = createContext({
  open: true,
  toggle: () => {},
});

export function SidebarProvider({ children }) {
  const [open, setOpen] = useState(true);

  const toggle = () => setOpen((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ open, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function SidebarTrigger({ className = "", children, ...props }) {
  const { toggle } = useContext(SidebarContext);

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-foreground hover:bg-muted transition-colors ${className}`}
      {...props}
    >
      {children ?? <span className="sr-only">Toggle sidebar</span>}
    </button>
  );
}

export function SidebarInset({ className = "", ...props }) {
  return <main className={`flex-1 ${className}`} {...props} />;
}

export function Sidebar({ className = "", children, ...props }) {
  const { open } = useContext(SidebarContext);

  return (
    <aside
      className={`border-r border-gray-300/60 bg-gray-50   dark:bg-zinc-800 text-sidebar-foreground flex-none overflow-hidden transition-[width] duration-200 ${
        open ? "w-64" : "w-0"
      } ${className}`}
      {...props}
    >
      {children}
    </aside>
  );
}

export function SidebarContent({ className = "", children, ...props }) {
  return (
    <div className={`flex flex-col h-full ${className}`} {...props}>
      {children}
    </div>
  );
}

export function SidebarGroup({ className = "", children, ...props }) {
  return (
    <div className={`px-3 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function SidebarGroupLabel({ className = "", children, ...props }) {
  return (
    <div
      className={`px-2 pb-2 text-xs font-semibold uppercase text-muted-foreground ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarGroupContent({ className = "", children, ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function SidebarMenu({ className = "", children, ...props }) {
  return (
    <nav className={`flex flex-col gap-2 ${className}`} {...props}>
      {children}
    </nav>
  );
}

export function SidebarMenuItem({ className = "", children, ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function SidebarMenuButton({
  asChild = false,
  className = "",
  children,
  ...props
}) {
  const classes = `flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors ${className}`;

  if (asChild && children) {
    return (
      <div className={classes} {...props}>
        {children}
      </div>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}

