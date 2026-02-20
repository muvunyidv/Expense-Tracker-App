import { useState, useEffect } from "react";
import { Coffee, Home, ShoppingBag, Car, Utensils, Smartphone, Trash2, Loader2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import API from "../api";

// HELPER: Custom Date Formatter
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date).replace(/ /g, '/');
};

// HELPER: Robust icon picker
const getCategoryIcon = (categoryData) => {
  const categoryName = typeof categoryData === 'object' ? categoryData?.name : categoryData;
  const name = (categoryName || "").toLowerCase();

  if (name.includes("food") || name.includes("dining")) return <Utensils className="w-5 h-5 text-orange-500" />;
  if (name.includes("transport") || name.includes("car")) return <Car className="w-5 h-5 text-orange-500" />;
  if (name.includes("entertainment") || name.includes("coffee")) return <Coffee className="w-5 h-5 text-orange-500" />;
  if (name.includes("shopping") || name.includes("clothing")) return <ShoppingBag className="w-5 h-5 text-orange-500" />;
  if (name.includes("housing") || name.includes("utilities")) return <Home className="w-5 h-5 text-orange-500" />;
  if (name.includes("healthcare") || name.includes("phone")) return <Smartphone className="w-5 h-5 text-orange-500" />;
  return <ShoppingBag className="w-5 h-5 text-orange-500" />;
};

export function ExpenseList({ searchQuery = "", onEditExpense, onViewExpense }) {
  const [filter, setFilter] = useState("all");
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      // CLEANUP: We no longer fetch /plans here. 
      // Approved plans are already converted to real expenses by the backend.
      const response = await API.get("/expenses");
      
      const sorted = (response.data || []).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setRecentExpenses(sorted);
    } catch (error) {
      console.error("Failed to load expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    window.addEventListener("expensesUpdated", fetchExpenses);
    return () => window.removeEventListener("expensesUpdated", fetchExpenses);
  }, []);

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      // Direct deletion from expenses collection
      await API.delete(`/expenses/${expenseToDelete._id}`);
      
      setRecentExpenses(prev => prev.filter(expense => expense._id !== expenseToDelete._id));
      setExpenseToDelete(null);
      // Notify other components (like Dashboard totals)
      window.dispatchEvent(new Event("expensesUpdated"));
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  const filteredExpenses = recentExpenses.filter((expense) => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const expenseDate = new Date(expense.date);
    const now = new Date();

    switch (filter) {
      case "today":
        return expenseDate.toDateString() === now.toDateString();
      case "weekly":
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return expenseDate >= oneWeekAgo;
      case "monthly":
        return (
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      case "all":
      default:
        return true;
    }
  });

  const total = filteredExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);

  return (
    <>
      <Card className="border-gray-300/60 dark:border-zinc-700/60">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>My Expenses</CardTitle>
            <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
              {["all", "today", "weekly", "monthly"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                    filter === t 
                      ? "bg-orange-500 text-white shadow-sm" 
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <p className="text-sm text-muted-foreground font-medium">Loading your records...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-300/60 dark:divide-zinc-700/60">
              {filteredExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="bg-muted/50 p-4 rounded-full mb-4">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">No records here</h3>
                  <p className="text-sm text-muted-foreground max-w-[200px] mx-auto mt-1">
                    Your personal and approved work expenses will appear here.
                  </p>
                </div>
              ) : (
                filteredExpenses.map((expense) => {
                  const catName = typeof expense.categoryId === 'object' 
                    ? expense.categoryId?.name 
                    : expense.categoryId;

                  return (
                    <div 
                      key={expense._id} 
                      className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors px-2 -mx-2 rounded-lg"
                      onClick={() => onViewExpense && onViewExpense(expense)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 p-2 bg-muted rounded-lg shrink-0">
                          {getCategoryIcon(expense.categoryId)}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">
                            {expense.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span className="font-semibold text-orange-500/80">
                              {catName || "General"}
                            </span>
                            {" • "}{formatDate(expense.date)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-foreground text-sm sm:text-base">
                            {expense.amount.toLocaleString()} <span className="text-[10px] text-muted-foreground">Rwf</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onEditExpense && onEditExpense(expense)}
                            className="p-2 text-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-md transition-all hover:scale-105 active:scale-95"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setExpenseToDelete(expense)}
                            className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md transition-all hover:scale-105 active:scale-95"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-300/60 dark:border-zinc-700/60 flex items-center justify-between">
            <div className="font-semibold text-foreground uppercase text-sm tracking-wider">Total</div>
            <div className="text-xl font-bold text-orange-500">
              {total.toLocaleString()} Rwf
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmModal 
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={confirmDelete}
        itemName={expenseToDelete?.description}
      />
    </> 
  );
}