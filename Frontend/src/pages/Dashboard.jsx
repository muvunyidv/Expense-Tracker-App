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
import { LogOut, PlusCircle , AlignJustify} from "lucide-react";

export default function Dashboard({ onLogout }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => window.location.hash || "#summary");
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleLogout = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error("Failed to clear localStorage", e);
    }
    if (typeof onLogout === "function") onLogout();
  };

  const handleAddExpense = (expenseData) => {
    try {
      // Get existing expenses from localStorage
      const existingExpenses = localStorage.getItem("expenses");
      const expenses = existingExpenses ? JSON.parse(existingExpenses) : [];
      
      // Format the date
      const dateObj = new Date(expenseData.date);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      
      // Create new expense with ID
      const newExpense = {
        ...expenseData,
        date: formattedDate,
        id: Date.now().toString(),
      };
      
      // Add to expenses array
      expenses.push(newExpense);
      
      // Save to localStorage
      localStorage.setItem("expenses", JSON.stringify(expenses));
      
      // Trigger a custom event so ExpenseList can refresh
      window.dispatchEvent(new Event("expensesUpdated"));
      
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to add expense:", error);
    }
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
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-md">
            <div className="max-w-7xl mx-auto grid grid-cols-3 items-center gap-3 sm:gap-4 md:gap-6 px-4 md:px-6 py-2.5 md:py-3">
              <div className="flex items-center gap-2">
                <span className="md:hidden">
                  <SidebarTrigger />
                </span>
                <a href="#summary" className="hidden md:flex items-center gap-2">
                  <span className="inline-block h-6 w-6 rounded-md bg-orange-500" aria-hidden="true" />
                  <span className="text-lg font-semibold text-foreground">Expense Tracker</span>
                </a>
              </div>
              <div className="w-full justify-self-stretch md:justify-self-center md:max-w-xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search expenses..."
                  aria-label="Search expenses"
                  className="w-full px-3 py-2 rounded-md border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex items-center gap-2 md:gap-3 justify-self-end">
                <ThemeToggle />
                <button
                  type="button"
                  className="p-2 rounded-lg bg-muted hover:bg-orange-500 text-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-black transition-colors"
                  aria-label="Log out"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              {currentPage !== "#categories" && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="hidden">
                      <SidebarTrigger />
                    </span>
                    <div>
                      <h1 className="text-3xl font-semibold text-foreground">
                        {title}
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        {description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {currentPage === "#summary" && (
                      <button 
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:opacity-90 transition-colors">
                        <PlusCircle className="w-5 h-5" />
                        Add Expense
                      </button>
                    )}
                  </div>
                </div>
              )}

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
