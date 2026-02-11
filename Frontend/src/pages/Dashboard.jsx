import { useState, useEffect } from "react";
import { ExpenseList } from "../Components/ExpenseList";
import { ThemeToggle } from "../Components/ThemeToggle";
import { AppSidebar } from "../Components/AppSidebar";
import { AddExpenseForm } from "../Components/AddExpenseForm";
import { Categories } from "./Categories";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "../Components/ui/sidebar";
import { LogOut, PlusCircle, PanelLeft } from "lucide-react";

export default function Dashboard({ onLogout }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => window.location.hash || "#summary");

  useEffect(() => {
    const onHashChange = () => setCurrentPage(window.location.hash || "#summary");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const getPageTitle = () => {
    switch (currentPage) {
      case "#categories":
        return { title: "Categories", description: "Manage your expense categories" };
      case "#summary":
      default:
        return { title: "Expense Tracker", description: "Track and manage your expenses" };
    }
  };

  const handleAddExpense = (expenseData) => {
    console.log("New expense:", expenseData);
    // TODO: Send to backend API
    setIsFormOpen(false);
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case "#categories":
        return <Categories />;
      case "#summary":
      default:
        return <ExpenseList />;
    }
  };

  const { title, description } = getPageTitle();

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
                      {title}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      {description}
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
                        // Clear all localStorage and call the parent's logout handler
                        try {
                          localStorage.clear();
                        } catch (e) {
                          console.error("Failed to clear localStorage", e);
                        }
                        if (typeof onLogout === "function") onLogout();
                      }}
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                    <div className="pointer-events-none absolute right-0 mt-2 w-max rounded-md bg-black/90 px-2 py-1 text-xs text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 dark:bg-white dark:text-black">
                      Logout
                    </div>
                  </div>
                  <ThemeToggle />
                  {currentPage === "#summary" && (
                    <button 
                      onClick={() => setIsFormOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg filter-toggle-active hover:opacity-90 transition-colors">
                      <PlusCircle className="w-5 h-5" />
                      Add Expense
                    </button>
                  )}
                </div>
              </div>

              {/* Page Content */}
              {renderPageContent()}
            </div>
          </div>
        </SidebarInset>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddExpense}
      />
    </SidebarProvider>
  );
}