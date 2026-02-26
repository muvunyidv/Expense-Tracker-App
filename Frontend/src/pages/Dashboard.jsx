import { useState, useEffect, useRef, useCallback } from "react";
import { ExpenseList } from "../Components/ExpenseList";
import { AppSidebar, Footer } from "../Components/AppSidebar";
import { AddExpenseForm } from "../Components/AddExpenseForm";
import ExpenseViewModal from "../Components/ExpenseViewModal"; 
import { Categories } from "./Categories";
import { PlanList } from "../Components/PlanList"; 
import TodoPage from "./TodoPage"; 
import API from "../api";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "../Components/ui/sidebar";
import { LogOut, PlusCircle, User, ArrowRight, Wallet, ShieldCheck, UserCircle, Activity, CheckCircle2 } from "lucide-react";

function DashboardContent({ 
  user, totals, searchQuery, setSearchQuery, 
  categories, currentPage, title, description, handleOpenAddForm, 
  handleEditClick, handleViewClick, handleLogout, 
  menuRef, isUserMenuOpen, setIsUserMenuOpen, userInitial 
}) {
  
  const { isMobile, openMobile } = useSidebar();
  const isPersonalUser = user?.role === "user";

  const getMobileWidgetData = () => {
    switch (currentPage) {
      case "#todos": 
        return { 
          label: "Active Pipeline", 
          val: totals.todos?.pipeline || 0, 
          icon: <Activity className="w-5 h-5 text-orange-500" /> 
        };
      case "#plans": 
        return { 
          label: "Total Requested", 
          val: totals.plans || 0, 
          icon: <ShieldCheck className="w-5 h-5 text-orange-500" /> 
        };
      default: 
        return { 
          label: isPersonalUser ? "Total Spent" : "Team Total", 
          val: totals.summary || 0, 
          icon: <Wallet className="w-5 h-5 text-orange-500" /> 
        };
    }
  };
  const mobileWidget = getMobileWidgetData();

  return (
    <div className="flex min-h-screen w-full relative bg-background">
      <AppSidebar totals={totals} variant="inset" user={user} /> 
      
      <SidebarInset className="overflow-hidden">
        <div className="flex-1 flex flex-col h-full overflow-y-auto">
          {/* Header Section */}
          <div className="sticky top-0 z-50 bg-background/95 backdrop-blur shadow-sm border-b border-border/40">
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
                  placeholder={isPersonalUser ? "Search your spending..." : "Search team records..."}
                  className="w-full px-4 py-2 rounded-full border border-border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm font-medium"
                />
              </div>

              <div className="flex items-center gap-3 justify-self-end relative" ref={menuRef}>
                {!isMobile && (
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                    user?.role === "manager" 
                    ? "bg-blue-50 text-blue-600 border-blue-200" 
                    : "bg-orange-50 text-orange-600 border-orange-200"
                  }`}>
                    {user?.role === "manager" ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserCircle className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-black uppercase tracking-tight">
                      {isPersonalUser ? "Personal Account" : user?.role}
                    </span>
                  </div>
                )}

                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="h-9 w-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md hover:scale-105 transition-transform"
                >
                  {userInitial}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 rounded-xl border border-zinc-200 shadow-2xl p-2 z-[999] bg-white">
                    <div className="px-4 py-3 border-b border-border/50 mb-1">
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Account Type</p>
                      <p className="text-sm font-bold truncate mt-0.5 text-zinc-900 capitalize">{user?.username || 'User'}</p>
                      <p className="text-xs text-zinc-500 truncate font-medium">{user?.email}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              
              {/* TOP WIDGETS */}
              {currentPage === "#todos" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 animate-in fade-in duration-500">
                   <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-between shadow-sm">
                     <div>
                       <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Pipeline Commitment</p>
                       <p className="text-2xl font-black text-zinc-900">{(totals.todos?.pipeline || 0).toLocaleString()} <span className="text-xs font-bold text-zinc-400">Rwf</span></p>
                     </div>
                     <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-orange-500" />
                     </div>
                   </div>
                   <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between shadow-sm">
                     <div>
                       <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Executed (Done)</p>
                       <p className="text-2xl font-black text-emerald-700">{(totals.todos?.completed || 0).toLocaleString()} <span className="text-xs font-bold text-emerald-400">Rwf</span></p>
                     </div>
                     <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                     </div>
                   </div>
                </div>
              )}

              {currentPage === "#categories" ? (
                <Categories onCategoriesChange={() => window.dispatchEvent(new Event("categoriesUpdated"))} />
              ) : currentPage === "#plans" ? (
                <PlanList /> 
              ) : currentPage === "#todos" ? (
                <TodoPage />
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
                      {isPersonalUser ? "Add New Expense" : "Add Team Expense"}
                    </button>
                  </div>

                  <ExpenseList 
                    searchQuery={searchQuery} 
                    onEditExpense={handleEditClick}
                    onViewExpense={handleViewClick} 
                  />

                  {categories.length === 0 && (
                    <div className="text-center py-8 bg-muted/20 rounded-2xl border border-dashed border-border">
                      <p className="text-sm text-muted-foreground font-medium">
                        {isPersonalUser ? "Start by setting up your spending categories." : "You need to create categories for your team first."}{" "}
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
          <Footer />
        </div>
      </SidebarInset>

      {/* Floating Mobile Widget */}
      {isMobile && !openMobile && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-3 px-6 py-3 bg-white text-zinc-900 rounded-2xl shadow-xl border border-zinc-200 backdrop-blur-md">
            {mobileWidget.icon}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                {mobileWidget.label}
              </span>
              <span className="text-base font-black tracking-tight">
                {mobileWidget.val.toLocaleString()} <span className="text-[10px] text-zinc-500">Rwf</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ onLogout, user: initialUser }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const [user, setUser] = useState(initialUser);
  const [currentPage, setCurrentPage] = useState(() => window.location.hash || "#summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  
  const [totalExpenses, setTotalExpenses] = useState(0); 
  const [totalRequested, setTotalRequested] = useState(0); 
  const [totalPlans, setTotalPlans] = useState({ pipeline: 0, completed: 0 }); 

  const menuRef = useRef(null);
  const isPersonalUser = user?.role === "user";

  const fetchAllTotals = useCallback(async () => {
    try {
      const expRes = await API.get("/expenses");
      setTotalExpenses(expRes.data.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0));

      const planRes = await API.get("/plans");
      const calculatedRequests = planRes.data.reduce((acc, curr) => {
        const finalAmount = curr.approvedAmount !== undefined ? curr.approvedAmount : curr.amount;
        return acc + (Number(finalAmount) || 0);
      }, 0);
      setTotalRequested(calculatedRequests);

      const todoRes = await API.get("/todos");
      const pipeline = todoRes.data
        .filter(t => !t.completed && t.status !== 'completed')
        .reduce((acc, curr) => acc + (Number(curr.estCost || curr.amount || curr.cost || 0)), 0);
      
      const completed = todoRes.data
        .filter(t => t.completed || t.status === 'completed')
        .reduce((acc, curr) => acc + (Number(curr.estCost || curr.amount || curr.cost || 0)), 0);

      setTotalPlans({ pipeline, completed });
    } catch (err) {
      console.error("Error fetching totals:", err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {}
  }, []);

  // Global Refresh Listener Effect
  useEffect(() => {
    const handleRefresh = () => {
      fetchAllTotals();
      fetchCategories();
    };

    window.addEventListener("expensesUpdated", handleRefresh);
    window.addEventListener("categoriesUpdated", fetchCategories);
    window.addEventListener("plansUpdated", handleRefresh);
    window.addEventListener("todosUpdated", handleRefresh); // Added for TodoPage support

    return () => {
      window.removeEventListener("expensesUpdated", handleRefresh);
      window.removeEventListener("categoriesUpdated", fetchCategories);
      window.removeEventListener("plansUpdated", handleRefresh);
      window.removeEventListener("todosUpdated", handleRefresh);
    };
  }, [fetchAllTotals, fetchCategories]);

  // Auth & Lifecycle Effect
  useEffect(() => {
    if (!user) {
      const fetchUserData = async () => {
        try {
          const res = await API.get("/auth/me");
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        } catch (err) {
          if (err.response?.status === 401) onLogout();
        }
      };
      fetchUserData();
    }

    const onHashChange = () => {
      setCurrentPage(window.location.hash || "#summary");
      setIsUserMenuOpen(false); 
    };

    window.addEventListener("hashchange", onHashChange);
    
    // Initial data fetch
    fetchCategories();
    fetchAllTotals(); 

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
  }, [user, onLogout, fetchAllTotals, fetchCategories]);

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

  const pageInfo = (function getPageTitle() {
    switch (currentPage) {
      case "#categories":
        return { title: "Categories", description: isPersonalUser ? "How you group your spending" : "Organize team habits" };
      case "#plans":
        return { title: "Approval Queue", description: "Authorize expenditures or adjust amounts" };
      case "#todos":
        return { title: "Planned Tasks", description: "Timeline & Execution" };
      default:
        return { 
          title: isPersonalUser ? "My Spending" : "Management Dashboard", 
          description: isPersonalUser ? "Track your personal finances" : "Overview of team and approved spending" 
        };
    }
  })();

  const userInitial = user?.username?.charAt(0).toUpperCase() || <User className="w-4 h-4" />;

  return (
    <SidebarProvider>
      <DashboardContent 
        {...{ 
          user, 
          totals: {
            summary: totalExpenses,
            plans: totalRequested,
            todos: totalPlans
          }, 
          searchQuery, 
          setSearchQuery, 
          categories, 
          currentPage, 
          title: pageInfo.title, 
          description: pageInfo.description, 
          userInitial, 
          isUserMenuOpen, 
          setIsUserMenuOpen, 
          menuRef 
        }}
        handleLogout={handleLogout}
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
        data={viewingExpense} 
      />
    </SidebarProvider>
  );
}
