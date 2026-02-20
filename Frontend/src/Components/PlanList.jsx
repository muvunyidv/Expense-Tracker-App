import { useState, useEffect } from "react";
import { ListChecks, Clock, CheckCircle2, XCircle, Plus, Loader2, AlertCircle, ClipboardList, Check, X } from "lucide-react";
// FIX: Changed "Components" to "components" to solve the casing error from your screenshot
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { AddPlanModal } from "./AddPlanModal"; 
import API from "../api";

export function PlanList() {
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState("staff");

  // 1. FIX URL HASH ISSUE: Automatically removes "#summary" if it exists
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // 2. Extract role from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload.role || "staff");
      } catch (e) {
        console.error("Token parse error", e);
      }
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, catsRes] = await Promise.all([
        API.get("/plans"),
        API.get("/categories")
      ]);
      setPlans(plansRes.data || []);
      setCategories(catsRes.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await API.patch(`/plans/${id}/status`, { status: newStatus });
      fetchData();
    } catch (error) {
      alert("Failed to update status");
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Requirements</h1>
          <p className="text-sm text-muted-foreground">
            {userRole === 'manager' ? "Review and manage all requests" : "Your supply requests"}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-orange-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" /> New Request
        </button>
      </div>

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
            {plans.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toLocaleString()} <span className="text-xs font-normal">Rwf</span>
          </span>
        </div>
      </div>

      <Card className="border-gray-300/60 dark:border-zinc-700/60 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle className="text-lg flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-orange-500" />
            Requirement Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20"><p className="text-muted-foreground font-medium">No requirements found.</p></div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
              {plans.map((plan) => {
                const ui = getStatusUI(plan.status);
                return (
                  <div key={plan._id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${ui.color}`}>{ui.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-foreground">{plan.description}</span>
                           {plan.priority === 'urgent' && <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase">Urgent</span>}
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
                        <div className="font-black text-foreground text-lg">{plan.amount?.toLocaleString()} Rwf</div>
                        <div className={`text-[10px] uppercase font-black ${getPriorityColor(plan.priority)}`}>{plan.priority}</div>
                      </div>

                      {userRole === "manager" && plan.status === "pending" ? (
                        <div className="flex gap-2 ml-4">
                          <button 
                            onClick={() => handleStatusUpdate(plan._id, 'approved')}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md shadow-green-500/20"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(plan._id, 'rejected')}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md shadow-red-500/20"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className={`text-[10px] font-black uppercase px-2 py-1 rounded ${ui.color} ml-4`}>
                          {ui.label}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

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