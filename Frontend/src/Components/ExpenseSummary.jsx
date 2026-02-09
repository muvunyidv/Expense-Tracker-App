import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

function SummaryCard({ title, icon }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardHeader>
    </Card>
  );
}

export function ExpenseSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SummaryCard
        title="Total Expenses"
        icon={<DollarSign className="w-5 h-5" />}
      />
      <SummaryCard
        title="Budget Remaining"
        icon={<Wallet className="w-5 h-5" />}
      />
      <SummaryCard
        title="Monthly Budget"
        icon={<TrendingUp className="w-5 h-5" />}
      />
    </div>
  );
}
