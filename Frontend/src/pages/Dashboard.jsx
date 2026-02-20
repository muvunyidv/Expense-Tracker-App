import { useState, useEffect, useRef } from "react";
import { ExpenseList } from "../Components/ExpenseList";
import { ThemeToggle } from "../Components/ThemeToggle";
import { AppSidebar, Footer } from "../Components/AppSidebar";
import { AddExpenseForm } from "../Components/AddExpenseForm";
import { ExpenseViewModal } from "../Components/ExpenseViewModal";
import { Categories } from "./Categories";
import { PlanList } from "../Components/PlanList"; 
import API from "../api";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "../Components/ui/sidebar";
import { LogOut, PlusCircle, User, ArrowRight, Wallet, ShieldCheck } from "lucide-react";

// Sub-component for the main dashboard layout
function DashboardContent({ 
  onLogout, user, totalExpenses, searchQuery, setSearchQuery, 
  categories, currentPage, title, description, handleOpenAddForm, 
  handleEditClick, handleViewClick, fetchCategories, handleLogout, 
  menuRef, isUserMenuOpen, setIsUserMenuOpen, userInitial 
}) {
  
  const { isMobile, openMobile } = useSidebar();

  return (
    <div className="flex min-h-screen w-full relative">
      {/* Pass the real user object here to fix the Sidebar labels */}
      <AppSidebar total={totalExpenses} variant="inset" user={user} /> 
      
      <SidebarInset>
        <div className="flex-1 flex flex-col">
          {/* Top Navigation Bar */}
          <div className="sticky top-0 z-50 bg-background/95 backdrop-blur shadow-lg border-b/80 border-gray-100">
            <div className="max-w-7xl mx-auto grid grid-cols-3 items-center px-4 md:px-6 py-3">
              <div className="flex items-center gap-2">
                <span className="md:hidden"><SidebarTrigger /></span>
                <a href="#summary" className="hidden md:flex items-center gap-2 group">
                  <span className="inline-block h-6 w-6 rounded-md bg-orange-500 shadow-sm shadow-orange-500/50 group-hover:rotate-12 transition-transform" />
                  <span className="text-lg font-bold tracking-tight text-foreground">Expense Tracker</span>
                </a>
              </div>
              
              <div className="w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your records..."
                  className="w-full px-4 py-2 rounded-full border border-border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm font-medium"
                />
              </div>

              <div className="flex items-center gap-3 justify-self-end relative" ref={menuRef}>
                {/* ROLE BADGE: Shows if the user is a manager */}
                {user?.role === "manager" && !isMobile && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800 animate-in fade-in zoom-in-90">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-tight">Manager</span>
                  </div>
                )}

                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="h-9 w-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md hover:scale-105 transition-transform active:scale-95 ring-2 ring-offset-2 ring-transparent hover:ring-orange-500/20"
                >
                  {userInitial}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 rounded-xl border border-border shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-100 z-[999] bg-white dark:bg-[#1c1c1c]">
                    <div className="px-4 py-3 border-b border-border/50 mb-1">
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest">Account</p>
                      <p className="text-sm font-bold truncate mt-0.5 text-zinc-900 dark:text-white capitalize">{user?.username || 'User'}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate font-medium">{user?.email}</p>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-default">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">Appearance</span>
                      <ThemeToggle />
                    </div>
                    <div className="h-px bg-border/50 my-1" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              
              {currentPage === "#categories" ? (
                <Categories onCategoriesChange={fetchCategories} />
              ) : currentPage === "#plans" ? (
                <PlanList /> 
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-black tracking-tight text-foreground">{title}</h1>
                      <p className="text-muted-foreground mt-1 text-sm font-medium">{description}</p>
                    </div>
                    <button 
                      onClick={handleOpenAddForm}
                      disabled={categories.length === 0}
                      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black transition-all shadow-lg active:scale-95 ${
                        categories.length === 0 
                        ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60" 
                        : "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/30"
                      }`}
                    >
                      <PlusCircle className="w-5 h-5" />
                      Add Personal Expense
                    </button>
                  </div>

                  <ExpenseList 
                    searchQuery={searchQuery} 
                    onEditExpense={handleEditClick}
                    onViewExpense={handleViewClick} 
                  />

                  {categories.length === 0 && (
                    <div className="text-center py-8 bg-muted/20 rounded-2xl border border-dashed border-border animate-in fade-in duration-700">
                      <p className="text-sm text-muted-foreground font-medium">
                        You need to create categories first.{" "}
                        <a href="#categories" className="text-orange-500 font-black hover:underline inline-flex items-center gap-0.5">
                          Set up categories <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </SidebarInset>

      {/* Floating Mobile Stats Card */}
      {isMobile && !openMobile && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 px-6 py-3 bg-zinc-900/95 dark:bg-orange-600 text-white rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
            <Wallet className="w-5 h-5 text-white/80" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Personal Total</span>
              <span className="text-base font-black tracking-tight">
                {totalExpenses.toLocaleString()} <span className="text-[10px]">Rwf</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Controller Component
export default function Dashboard({ onLogout, user: initialUser }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Use user from props or fall back to local fetch
  const [user, setUser] = useState(initialUser);
  
  const [currentPage, setCurrentPage] = useState(() => window.location.hash || "#summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0); 
  const menuRef = useRef(null);

  useEffect(() => {
    // If App.jsx didn't have the user yet (refresh), fetch it now
    if (!user) {
      fetchUserData();
    }

    const onHashChange = () => {
      setCurrentPage(window.location.hash || "#summary");
      setIsUserMenuOpen(false); 
    };

    window.addEventListener("hashchange", onHashChange);
    fetchCategories();
    fetchTotal();

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("expensesUpdated", fetchTotal);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("expensesUpdated", fetchTotal);
    };
  }, [user]);

  const fetchUserData = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data);
      // Sync localstorage for App.jsx to pick up on next refresh
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      console.error("Auth failed", err);
      if (err.response?.status === 401) onLogout();
    }
  };

  const fetchTotal = async () => {
    try {
      const res = await API.get("/expenses");
      const total = res.data.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      setTotalExpenses(total);
    } catch (err) {
      console.error("Failed to fetch total", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {}
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (typeof onLogout === "function") onLogout();
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

  const { title, description } = (function getPageTitle() {
    switch (currentPage) {
      case "#categories":
        return { title: "Categories", description: "Organize your spending habits" };
      case "#plans":
        return { title: "Work Requirements", description: "Submit and track budget approvals" };
      default:
        return { title: "My Dashboard", description: "Overview of your personal and approved work spending" };
    }
  })();

  const userInitial = user?.username?.charAt(0).toUpperCase() || <User className="w-4 h-4" />;

  return (
    <SidebarProvider>
      <DashboardContent 
        {...{ onLogout, user, totalExpenses, searchQuery, setSearchQuery, categories, currentPage, title, description, userInitial, isUserMenuOpen, setIsUserMenuOpen, menuRef }}
        handleLogout={handleLogout}
        fetchCategories={fetchCategories}
        handleOpenAddForm={() => { setEditingExpense(null); setIsFormOpen(true); }}
        handleEditClick={(exp) => { setEditingExpense(exp); setIsFormOpen(true); }}
        handleViewClick={setViewingExpense}
      />

      <AddExpenseForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingExpense(null); }}
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