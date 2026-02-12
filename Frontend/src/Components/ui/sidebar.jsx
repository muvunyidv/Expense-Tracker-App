import { cloneElement, createContext, isValidElement, useContext, useState } from "react";

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
      className={`border-r border-border/60 bg-sidebar text-sidebar-foreground flex-none overflow-hidden transition-[width] duration-200 ${
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
    <nav className={`flex flex-col gap-4 ${className}`} {...props}>
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
  active = false,
  className = "",
  children,
  ...props
}) {
  const classes = [
    "group flex w-full items-center gap-3 rounded-md px-4 py-3 text-xl mt-2",
    "transition-all duration-200",
    "hover:bg-muted/60 hover:translate-x-0.5 hover:text-orange-500",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40",
    active
      ? "bg-muted/70 text-black font-medium ring-1 ring-orange-500/60"
      : "text-sidebar-foreground/80",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (asChild && isValidElement(children)) {
    const childClassName = children.props?.className ?? "";
    return cloneElement(children, {
      ...props,
      className: `${classes} ${childClassName}`.trim(),
      "aria-current": active ? "page" : undefined,
    });
  }

  return (
    <button
      type="button"
      className={classes}
      aria-current={active ? "page" : undefined}
      {...props}
    >
      {children}
    </button>
  );
}

