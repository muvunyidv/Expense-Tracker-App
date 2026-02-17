import { useState, useEffect } from "react";
import { Coffee, Home, ShoppingBag, Car, Utensils, Smartphone, Trash2, Loader2, Pencil, AlertTriangle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import API from "../api";

/* ================================
   Custom Delete Confirmation Modal
================================ */
function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden border border-gray-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h3 className="text-xl font-bold text-black dark:text-white mb-2">Delete Expense?</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Are you sure you want to delete <span className="font-semibold text-black dark:text-white">"{itemName}"</span>? This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-zinc-800 text-black dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const getCategoryIcon = (categoryName = "") => {
  const name = categoryName.toLowerCase();
  if (name.includes("food") || name.includes("dining")) return <Utensils className="w-5 h-5 text-orange-500" />;
  if (name.includes("transport") || name.includes("car")) return <Car className="w-5 h-5 text-orange-500" />;
  if (name.includes("entertainment") || name.includes("coffee")) return <Coffee className="w-5 h-5 text-orange-500" />;
  if (name.includes("shopping") || name.includes("clothing")) return <ShoppingBag className="w-5 h-5 text-orange-500" />;
  if (name.includes("housing") || name.includes("utilities")) return <Home className="w-5 h-5 text-orange-500" />;
  if (name.includes("healthcare") || name.includes("phone")) return <Smartphone className="w-5 h-5 text-orange-500" />;
  return <ShoppingBag className="w-5 h-5 text-orange-500" />;
};

export function ExpenseList({ searchQuery = "", onEditExpense, onViewExpense }) {
  const [filter, setFilter] = useState("daily");
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: State for the custom delete popup
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/expenses");
      setRecentExpenses(res.data);
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

  // Updated: Actual deletion logic called by the custom modal
  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await API.delete(`/expenses/${expenseToDelete._id}`);
      setRecentExpenses(prev => prev.filter(expense => expense._id !== expenseToDelete._id));
      setExpenseToDelete(null); // Close the popup
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  const filteredExpenses = recentExpenses.filter((expense) => {
    const query = searchQuery.toLowerCase();
    return expense.description?.toLowerCase().includes(query);
  });

  const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <>
      <Card className="border-gray-300/60 dark:border-zinc-700/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Expenses</CardTitle>
            <div className="flex gap-2">
              {["daily", "weekly", "monthly"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors ${
                    filter === t ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
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
              <p className="text-sm text-muted-foreground">Fetching expenses...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-300/60 dark:divide-zinc-700/60">
              {filteredExpenses.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No expenses found.
                </div>
              ) : (
                filteredExpenses.map((expense) => (
                  <div 
                    key={expense._id} 
                    className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors px-2 -mx-2 rounded-lg"
                    onClick={() => onViewExpense && onViewExpense(expense)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2 bg-muted rounded-lg shrink-0">
                        {getCategoryIcon(expense.categoryId?.name)}
                      </div>
                      <div>
                        <div className="font-bold text-black dark:text-black">
                          {expense.description}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {expense.categoryId?.name || "Uncategorized"} • {new Date(expense.date).toLocaleDateString()}
                        </div>
                        {expense.notes && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {expense.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-black dark:text-black mr-2">
                        {expense.amount.toLocaleString()} Rwf
                      </div>
                      
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onEditExpense && onEditExpense(expense)}
                          className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                          title="Edit Expense"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setExpenseToDelete(expense)} // Updated: Trigger the popup
                          className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-300/60 dark:border-zinc-700/60 flex items-center justify-between">
            <div className="font-semibold text-black uppercase text-sm tracking-wider">Total</div>
            <div className="text-xl font-bold text-orange-500">
              {total.toLocaleString()} Rwf
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NEW: Custom Delete Confirmation Popup */}
      <DeleteConfirmModal 
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={confirmDelete}
        itemName={expenseToDelete?.description}
      />
    </>
  );
}