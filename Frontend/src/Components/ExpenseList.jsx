import { useState } from "react";
import { Coffee, Home, ShoppingBag, Car, Utensils, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const recentExpenses = [
  {
    id: "1",
    category: "Food & Dining",
    description: "Grocery Shopping",
    amount: 127.45,
    date: "Feb 8, 2026",
    icon: <ShoppingBag className="w-5 h-5" />,
  },
  {
    id: "2",
    category: "Transportation",
    description: "Gas Station",
    amount: 52.00,
    date: "Feb 7, 2026",
    icon: <Car className="w-5 h-5" />,
  },
  {
    id: "3",
    category: "Food & Dining",
    description: "Coffee Shop",
    amount: 8.50,
    date: "Feb 7, 2026",
    icon: <Coffee className="w-5 h-5" />,
  },
  {
    id: "4",
    category: "Housing",
    description: "Electricity Bill",
    amount: 145.20,
    date: "Feb 6, 2026",
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: "5",
    category: "Food & Dining",
    description: "Restaurant",
    amount: 64.30,
    date: "Feb 5, 2026",
    icon: <Utensils className="w-5 h-5" />,
  },
  {
    id: "6",
    category: "Shopping",
    description: "Electronics",
    amount: 299.99,
    date: "Feb 4, 2026",
    icon: <Smartphone className="w-5 h-5" />,
  },
];

export function ExpenseList() {
  const [filter, setFilter] = useState("daily");

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
          {recentExpenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between py-3 border-b border-gray-300/60 dark:border-zinc-700/60 last:border-b-0"
          >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  {expense.icon}
                </div>
                <div>
                  <div className="font-medium">{expense.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {expense.category} • {expense.date}
                  </div>
                </div>
              </div>
              <div className="font-semibold">
                -${expense.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-300/60 dark:border-zinc-700/60 flex items-center justify-between">
          <div className="font-semibold">Total</div>
          <div className="text-xl font-semibold">
            -${total.toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
