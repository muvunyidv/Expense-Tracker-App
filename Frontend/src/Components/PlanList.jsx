import { useState, useEffect } from "react";
import { ListChecks, Clock, CheckCircle2, XCircle, Plus, Loader2, Trash2, AlertCircle, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AddPlanModal } from "./AddPlanModal"; 
import API from "../api";

export function PlanList() {
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetching both datasets in parallel for speed
      const [plansRes, catsRes] = await Promise.all([
        API.get("/plans"),
        API.get("/categories")
      ]);
      
      // Ensure we always default to an empty array to prevent .map errors
      setPlans(plansRes.data || []);
      setCategories(catsRes.data || []);
      
      // DIAGNOSTIC: Check this in your browser console (F12)
      console.log("PlanList Categories State:", catsRes.data); 
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusUI = (status) => {
    switch (status) {
      case "approved": 
        return { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-green-500 bg-green-500/10", label: "Approved" };
      case "rejected": 
        return { icon: <XCircle className="w-4 h-4" />, color: "text-red-500 bg-red-500/10", label: "Rejected" };
      default: 
        return { icon: <Clock className="w-4 h-4" />, color: "text-amber-500 bg-amber-500/10", label: "Pending" };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "text-red-600 dark:text-red-400 font-black";
      case "low": return "text-zinc-400 font-medium";
      default: return "text-zinc-600 dark:text-zinc-300 font-medium";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Requirements</h1>
          <p className="text-sm text-muted-foreground">Household & Business supply requests</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-orange-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" /> New Request
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex justify-between items-center">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending</span>
          <span className="text-xl font-black">{plans.filter(p => p.status === 'pending').length}</span>
        </div>
        <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl flex justify-between items-center">
          <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Approved</span>
          <span className="text-xl font-black">{plans.filter(p => p.status === 'approved').length}</span>
        </div>
        <div className="p-4 bg-muted rounded-2xl flex justify-between items-center">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Value</span>
          <span className="text-xl font-black text-foreground">
            {plans.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} <span className="text-xs font-normal">Rwf</span>
          </span>
        </div>
      </div>

      {/* Main List Table */}
      <Card className="border-gray-300/60 dark:border-zinc-700/60 shadow-xl shadow-black/5 overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle className="text-lg flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-orange-500" />
            Requirement Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
              <p className="mt-4 text-sm text-muted-foreground font-medium">Fetching requirements...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex p-4 bg-muted rounded-full mb-4">
                <ClipboardList className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No requirements found.</p>
              <button onClick={() => setIsModalOpen(true)} className="mt-2 text-orange-500 text-sm font-bold hover:underline">
                Create a new request
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
              {plans.map((plan) => {
                const ui = getStatusUI(plan.status);
                return (
                  <div key={plan._id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${ui.color}`}>
                        {ui.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-foreground">{plan.description}</span>
                           {plan.priority === 'urgent' && (
                             <span className="flex items-center gap-0.5 text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase animate-pulse">
                               <AlertCircle className="w-2.5 h-2.5" /> Urgent
                             </span>
                           )}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5 uppercase font-medium">
                          <span className="text-orange-500 font-bold">{plan.category}</span>
                          <span className="opacity-30">•</span>
                          <span>{plan.userId?.username || "Staff"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-black text-foreground text-lg">
                          {plan.amount.toLocaleString()} <span className="text-[10px] font-normal opacity-70">Rwf</span>
                        </div>
                        <div className={`text-[10px] uppercase tracking-tighter font-black ${getPriorityColor(plan.priority)}`}>
                          {plan.priority} priority
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL INTEGRATION */}
      {/* key={categories.length} ensures the modal re-mounts when data arrives */}
      <AddPlanModal 
        key={`modal-${categories.length}`}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        categories={categories}
        onSuccess={fetchData}
      />
    </div>
  );
}