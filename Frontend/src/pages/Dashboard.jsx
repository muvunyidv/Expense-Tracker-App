import { ExpenseList } from "../Components/ExpenseList";
import { ThemeToggle } from "../Components/ThemeToggle";
import { AppSidebar } from "../Components/AppSidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "../Components/ui/sidebar";
import { LogOut, PlusCircle, PanelLeft } from "lucide-react";

export default function Dashboard() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SidebarTrigger>
                    <PanelLeft className="w-5 h-5" />
                  </SidebarTrigger>
                  <div>
                    <h1 className="text-3xl font-semibold">
                      Expense Tracker
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Track and manage your expenses
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <button
                      type="button"
                      className="p-2 rounded-lg bg-muted hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                      aria-label="Log out"
                      onClick={() => {
                        // TODO: wire up real logout when auth is added
                        console.log("Logout clicked");
                      }}
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                    <div className="pointer-events-none absolute right-0 mt-2 w-max rounded-md bg-black/90 px-2 py-1 text-xs text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 dark:bg-white dark:text-black">
                      Logout
                    </div>
                  </div>
                  <ThemeToggle />
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg filter-toggle-active hover:opacity-90 transition-colors">
                    <PlusCircle className="w-5 h-5" />
                    Add Expense
                  </button>
                </div>
              </div>

              {/* Expense List */}
              <ExpenseList />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}