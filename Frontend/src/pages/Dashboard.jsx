import { useState, useEffect, useRef } from "react";
import { ExpenseList } from "../Components/ExpenseList";
import { ThemeToggle } from "../Components/ThemeToggle";
import { AppSidebar, Footer } from "../Components/AppSidebar"; // IMPORTED FOOTER
import { AddExpenseForm } from "../Components/AddExpenseForm";
import { ExpenseViewModal } from "../Components/ExpenseViewModal";
import { Categories } from "./Categories";
import API from "../api";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "../Components/ui/sidebar";
import { LogOut, PlusCircle, User, ArrowRight } from "lucide-react";

export default function Dashboard({ onLogout }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => window.location.hash || "#summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    const onHashChange = () => {
      const newHash = window.location.hash || "#summary";
      setCurrentPage(newHash);
      fetchCategories(); 
    };

    window.addEventListener("hashchange", onHashChange);
    fetchCategories();
    fetchUserData();

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (typeof onLogout === "function") onLogout();
  };

  const handleOpenAddForm = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleViewClick = (expense) => {
    setViewingExpense(expense);
  };

  const handleFormSubmit = async (expenseData) => {
    try {
      if (editingExpense) {
        await API.put(`/expenses/${editingExpense._id}`, expenseData);
      } else {
        await API.post("/expenses", expenseData);
      }
      window.dispatchEvent(new Event("expensesUpdated"));
      setIsFormOpen(false);
      setEditingExpense(null);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to save expense");
    }
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case "#categories":
        return <Categories onCategoriesChange={fetchCategories} />;
      case "#summary":
      default:
        return (
          <ExpenseList 
            searchQuery={searchQuery} 
            onEditExpense={handleEditClick}
            onViewExpense={handleViewClick} 
          />
        );
    }
  };

  const { title, description } = (function getPageTitle() {
    switch (currentPage) {
      case "#categories":
        return { title: "Categories", description: "Manage your expense categories" };
      case "#summary":
      default:
        return { title: "Expense Tracker", description: "Track and manage your expenses" };
    }
  })();

  const userInitial = user?.username?.charAt(0).toUpperCase() || <User className="w-4 h-4" />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          {/* Main Content Wrapper */}
          <div className="flex-1 flex flex-col">
            <div className="sticky top-0 z-50 bg-background/95 backdrop-blur shadow-sm border-b border-border">
              <div className="max-w-7xl mx-auto grid grid-cols-3 items-center px-4 md:px-6 py-3">
                <div className="flex items-center gap-2">
                  <span className="md:hidden"><SidebarTrigger /></span>
                  <a href="#summary" className="hidden md:flex items-center gap-2">
                    <span className="inline-block h-6 w-6 rounded-md bg-orange-500 shadow-sm shadow-orange-500/50" />
                    <span className="text-lg font-bold tracking-tight">Expense Tracker</span>
                  </a>
                </div>
                
                <div className="w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search expenses..."
                    className="w-full px-4 py-2 rounded-full border border-border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                  />
                </div>

                <div className="flex items-center gap-3 justify-self-end relative" ref={menuRef}>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="h-9 w-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md hover:scale-105 transition-transform active:scale-95"
                  >
                    {userInitial}
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-64 rounded-xl border border-border shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-100 z-[999] bg-white dark:bg-[#1c1c1c] opacity-100">
                      <div className="px-4 py-3 border-b border-border/50 mb-1">
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">Account</p>
                        <p className="text-sm font-bold truncate mt-0.5 text-zinc-900 dark:text-white">{user?.username || 'User'}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user?.email}</p>
                      </div>
                      <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-default">
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">Appearance</span>
                        <ThemeToggle />
                      </div>
                      <div className="h-px bg-border/50 my-1" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-background p-6">
              <div className="max-w-7xl mx-auto space-y-6">
                {currentPage !== "#categories" && (
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                      <p className="text-muted-foreground mt-1">{description}</p>
                    </div>
                    {currentPage === "#summary" && (
                      <button 
                        onClick={handleOpenAddForm}
                        disabled={categories.length === 0}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-[10px] font-bold transition-all shadow-lg active:scale-95 ${
                          categories.length === 0 
                          ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60" 
                          : "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/30"
                        }`}
                      >
                        <PlusCircle className="w-5 h-5" />
                        Add Expense
                      </button>
                    )}
                  </div>
                )}

                {renderPageContent()}

                {currentPage === "#summary" && categories.length === 0 && (
                  <div className="text-center py-4 animate-in fade-in duration-700">
                    <p className="text-sm text-muted-foreground">
                      You need to create categories first.{" "}
                      <a href="#categories" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors inline-flex items-center gap-0.5">
                        Create a category <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CLEAN UTILITY FOOTER */}
          <Footer />
        </SidebarInset>
      </div>

      <AddExpenseForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleFormSubmit}
        categories={categories}
        initialData={editingExpense}
      />

      <ExpenseViewModal
        isOpen={!!viewingExpense}
        onClose={() => setViewingExpense(null)}
        expense={viewingExpense}
      />
    </SidebarProvider>
  );
}