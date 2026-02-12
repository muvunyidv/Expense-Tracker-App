import { useState, useEffect } from "react";
import { Coffee, Home, ShoppingBag, Car, Utensils, Smartphone, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const getCategoryIcon = (category) => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes("food") || categoryLower.includes("dining")) {
    return <Utensils className="w-5 h-5" />;
  } else if (categoryLower.includes("transport") || categoryLower.includes("car")) {
    return <Car className="w-5 h-5" />;
  } else if (categoryLower.includes("entertainment") || categoryLower.includes("coffee")) {
    return <Coffee className="w-5 h-5" />;
  } else if (categoryLower.includes("shopping")) {
    return <ShoppingBag className="w-5 h-5" />;
  } else if (categoryLower.includes("housing") || categoryLower.includes("utilities")) {
    return <Home className="w-5 h-5" />;
  } else if (categoryLower.includes("healthcare") || categoryLower.includes("phone")) {
    return <Smartphone className="w-5 h-5" />;
  }
  return <ShoppingBag className="w-5 h-5" />;
};

export function ExpenseList() {
  const [filter, setFilter] = useState("daily");
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Load expenses from localStorage on mount and when updated
  useEffect(() => {
    const loadExpenses = () => {
      try {
        const savedExpenses = localStorage.getItem("expenses");
        if (savedExpenses) {
          const expenses = JSON.parse(savedExpenses);
          setRecentExpenses(expenses);
        } else {
          setRecentExpenses([]);
        }
      } catch (error) {
        console.error("Failed to load expenses:", error);
        setRecentExpenses([]);
      }
    };

    loadExpenses();

    // Listen for updates from other components
    window.addEventListener("expensesUpdated", loadExpenses);
    return () => window.removeEventListener("expensesUpdated", loadExpenses);
  }, []);

  const handleDeleteExpense = (id) => {
    try {
      const updatedExpenses = recentExpenses.filter((expense) => expense.id !== id);
      setRecentExpenses(updatedExpenses);
      localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  const handleEditExpense = (id) => {
    setEditingId(id);
    // TODO: Open edit modal
  };

  const total = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <Card className="border-gray-300/60 dark:border-zinc-700/60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Expenses</CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("daily")}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === "daily"
                  ? "filter-toggle-active"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setFilter("weekly")}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === "weekly"
                  ? "filter-toggle-active"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setFilter("monthly")}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === "monthly"
                  ? "filter-toggle-active"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentExpenses.length === 0 ? (
            <div className="p-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No expenses yet. Add one to get started!
              </p>
            </div>
          ) : (
            recentExpenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between py-3 border-b border-gray-300/60 dark:border-zinc-700/60 last:border-b-0"
          >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  {getCategoryIcon(expense.category)}
                </div>
                <div>
                  <div className="font-medium">{expense.name || expense.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {expense.category} • {expense.date}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-semibold">
                  {expense.amount} FRw
                </div>
                <button
                  onClick={() => handleEditExpense(expense.id)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  aria-label="Edit expense"
                  title="Edit expense"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteExpense(expense.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  aria-label="Delete expense"
                  title="Delete expense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            ))
          )}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-300/60 dark:border-zinc-700/60 flex items-center justify-between">
          <div className="font-semibold">Total</div>
          <div className="text-xl font-semibold">
            {total} FRw
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
