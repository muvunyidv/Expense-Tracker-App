import { ExpenseList } from "./Components/ExpenseList";
import { ThemeToggle } from "./Components/ThemeToggle";
import { AppSidebar } from "./Components/AppSidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "./Components/ui/sidebar";
import { PlusCircle, PanelLeft } from "lucide-react";

export default function App() {
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
                  <ThemeToggle />
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
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