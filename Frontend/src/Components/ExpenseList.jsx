import { useState, useEffect } from "react";
import { Coffee, Home, ShoppingBag, Car, Utensils, Smartphone, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import API from "../api";

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

export function ExpenseList({ searchQuery = "" }) {
  const [filter, setFilter] = useState("daily");
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await API.delete(`/expenses/${id}`);
      setRecentExpenses(prev => prev.filter(expense => expense._id !== id));
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
                <div key={expense._id} className="flex items-center justify-between py-4">
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
                      {/* Note displayed directly below without border/background */}
                      {expense.notes && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {expense.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-bold text-black dark:text-black">
                      {expense.amount.toLocaleString()} FRw
                    </div>
                    <button
                      onClick={() => handleDeleteExpense(expense._id)}
                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-300/60 dark:border-zinc-700/60 flex items-center justify-between">
          <div className="font-semibold text-black uppercase text-sm tracking-wider">Total</div>
          <div className="text-xl font-bold text-orange-500">
            {total.toLocaleString()} FRw
          </div>
        </div>
      </CardContent>
    </Card>
  );
}