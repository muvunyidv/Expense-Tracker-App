import { useState, useEffect } from "react";
import { ExpenseList } from "../Components/ExpenseList";
import { ThemeToggle } from "../Components/ThemeToggle";
import { AppSidebar } from "../Components/AppSidebar";
import { AddExpenseForm } from "../Components/AddExpenseForm";
import { Categories } from "./Categories";
import API from "../api"; // Import your API instance
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "../Components/ui/sidebar";
import { LogOut, PlusCircle } from "lucide-react";

export default function Dashboard({ onLogout }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => window.location.hash || "#summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]); // Shared categories state

  useEffect(() => {
    const onHashChange = () => setCurrentPage(window.location.hash || "#summary");
    window.addEventListener("hashchange", onHashChange);
    
    // Fetch categories from backend on mount
    fetchCategories();

    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Only clear auth-related data
    if (typeof onLogout === "function") onLogout();
  };

  // Updated to talk to the Backend instead of LocalStorage
  const handleAddExpense = async (expenseData) => {
    try {
      // expenseData should now match your backend Expense model
      await API.post("/expenses", expenseData);
      
      // Trigger refresh for the ExpenseList component
      window.dispatchEvent(new Event("expensesUpdated"));
      
      setIsFormOpen(false);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to add expense");
    }
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case "#categories":
        // Pass fetch function to Categories so it can refresh the shared state
        return <Categories onCategoriesChange={fetchCategories} />;
      case "#summary":
      default:
        return <ExpenseList searchQuery={searchQuery} />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case "#categories":
        return { title: "Categories", description: "Manage your expense categories" };
      case "#summary":
      default:
        return { title: "Expense Tracker", description: "Track and manage your expenses" };
    }
  };

  const { title, description } = getPageTitle();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Header/Nav */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur shadow-sm">
            <div className="max-w-7xl mx-auto grid grid-cols-3 items-center px-4 md:px-6 py-3">
              <div className="flex items-center gap-2">
                <span className="md:hidden"><SidebarTrigger /></span>
                <a href="#summary" className="hidden md:flex items-center gap-2">
                  <span className="inline-block h-6 w-6 rounded-md bg-orange-500" />
                  <span className="text-lg font-semibold">Expense Tracker</span>
                </a>
              </div>
              
              <div className="w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search expenses..."
                  className="w-full px-3 py-2 rounded-md border border-border bg-muted focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-3 justify-self-end">
                <ThemeToggle />
                <button onClick={handleLogout} className="p-2 rounded-lg bg-muted text-orange-500 hover:bg-orange-500 hover:text-white transition-all">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {currentPage !== "#categories" && (
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold">{title}</h1>
                    <p className="text-muted-foreground mt-1">{description}</p>
                  </div>
                  {currentPage === "#summary" && (
                    <button 
                      onClick={() => setIsFormOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:opacity-90 transition-colors shadow-lg active:scale-95"
                    >
                      <PlusCircle className="w-5 h-5" />
                      Add Expense
                    </button>
                  )}
                </div>
              )}
              {renderPageContent()}
            </div>
          </div>
        </SidebarInset>
      </div>

      <AddExpenseForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddExpense}
        categories={categories} // Pass fetched categories down to the form
      />
    </SidebarProvider>
  );
}