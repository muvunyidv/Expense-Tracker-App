import { cloneElement, createContext, isValidElement, useContext, useEffect, useState } from "react";
import { AlignJustify, X } from "lucide-react";

const SidebarContext = createContext({
  open: true,
  toggle: () => {},
  isMobile: false,
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggle = () => setOpen((prev) => !prev);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    
    const sync = () => {
      const matches = mq.matches;
      setIsMobile(!matches);
      // Open by default on desktop, closed on mobile
      setOpen(matches);
    };

    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <SidebarContext.Provider value={{ open, toggle, isMobile, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function SidebarTrigger({ className = "", children, ...props }) {
  const { toggle, open } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-foreground hover:bg-muted transition-colors z-[60] ${className}`}
      {...props}
    >
      {children ??
        (open ? (
          <X className="w-5 h-5 text-orange-500" />
        ) : (
          <AlignJustify className="w-5 h-5 text-orange-500" />
        ))}
    </button>
  );
}

export function SidebarInset({ className = "", ...props }) {
  return <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${className}`} {...props} />;
}

export function Sidebar({ className = "", children, ...props }) {
  const { open, toggle, isMobile } = useSidebar();

  return (
    <>
      {/* MOBILE OVERLAY BACKDROP */}
      {isMobile && open && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[48] animate-in fade-in duration-300" 
          onClick={toggle}
        />
      )}

      <aside
        className={`
          bg-sidebar text-sidebar-foreground flex-none overflow-hidden transition-all duration-300 shadow-xl
          ${isMobile ? "fixed inset-y-0 left-0 z-[49]" : "sticky top-0 h-screen"}
          ${open ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 lg:w-64"}
          ${className}
        `}
        {...props}
      >
        <div className="w-64 h-full flex flex-col border-r border-border bg-background">
          {children}
        </div>
      </aside>
    </>
  );
}

export function SidebarContent({ className = "", children, ...props }) {
  return (
    <div className={`flex flex-col h-full overflow-y-auto ${className}`} {...props}>
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
      className={`px-2 pb-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarGroupContent({ className = "", children, ...props }) {
  return <div className={className} {...props}>{children}</div>;
}

export function SidebarMenu({ className = "", children, ...props }) {
  return (
    <nav className={`flex flex-col gap-1 ${className}`} {...props}>
      {children}
    </nav>
  );
}

export function SidebarMenuItem({ className = "", children, ...props }) {
  return <div className={className} {...props}>{children}</div>;
}

export function SidebarMenuButton({
  asChild = false,
  active = false,
  className = "",
  children,
  ...props
}) {
  const classes = [
    "group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium",
    "transition-all duration-200",
    "hover:bg-orange-500/10 hover:text-orange-600 dark:hover:bg-orange-500/20 dark:hover:text-orange-400",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
    active
      ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 ring-1 ring-orange-500/20"
      : "text-sidebar-foreground/70",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      ...props,
      className: `${classes} ${children.props?.className ?? ""}`.trim(),
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