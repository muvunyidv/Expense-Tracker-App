import { useState, useEffect } from "react";
import { ListChecks, Clock, CheckCircle2, XCircle, Plus, Loader2, ClipboardList, Check, X, History, User2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { AddPlanModal } from "./AddPlanModal"; 
import API from "../api";

export function PlanList() {
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState({ role: "staff", id: null });
  const [currentFilter, setCurrentFilter] = useState("pending");

  useEffect(() => {
    // Clear any messy hashes in the URL
    if (window.location.hash && window.location.hash !== "#plans") {
      window.history.replaceState(null, "", window.location.pathname);
    }

    // Decode token to get current user info
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserData({ role: payload.role || "staff", id: payload.id });
      } catch (e) {
        console.error("Token parse error", e);
      }
    }
    fetchData();
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

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await API.patch(`/plans/${id}/status`, { status: newStatus });
      
      // Update local state immediately for snappy UI
      setPlans(prev => prev.map(p => p._id === id ? { ...p, status: newStatus } : p));
      
      // If approved, notify the dashboard to refresh the total expenses
      if (newStatus === 'approved') {
        window.dispatchEvent(new Event("expensesUpdated"));
      }
      
      // Refresh data to ensure all ownership logic is synced
      fetchData();
    } catch (error) {
      alert("Action failed: Only managers can update status.");
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

  // Filter the list based on selection
  const filteredPlans = plans.filter(p => p.status === currentFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
            {userData.role === "manager" ? "Approval Queue" : "My Requests"}
          </h1>
          <p className="text-sm text-muted-foreground italic">
            {userData.role === "manager" 
              ? "Review staff requirements or track your own history" 
              : "Submit new spending requirements for approval"}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-orange-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" /> New Request
        </button>
      </div>

      {/* STATS CARDS / FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: "pending", label: "Pending", icon: Clock, color: "amber" },
          { id: "approved", label: "Approved", icon: CheckCircle2, color: "green" },
          { id: "rejected", label: "Rejected", icon: XCircle, color: "red" }
        ].map((card) => {
          const Icon = card.icon;
          const isActive = currentFilter === card.id;
          return (
            <button 
              key={card.id}
              onClick={() => setCurrentFilter(card.id)}
              className={`p-4 border rounded-2xl flex justify-between items-center transition-all text-left ${
                isActive 
                ? `bg-${card.color}-500/10 border-${card.color}-500 ring-2 ring-${card.color}-500/20 shadow-lg` 
                : "bg-muted/50 border-transparent hover:border-gray-300 dark:hover:border-zinc-700"
              }`}
            >
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? `text-${card.color}-600` : "text-muted-foreground"}`}>
                  {card.label}
                </span>
                <div className="text-2xl font-black text-foreground">
                  {plans.filter(p => p.status === card.id).length}
                </div>
              </div>
              <Icon className={`w-8 h-8 ${isActive ? `text-${card.color}-500` : "text-muted-foreground/30"}`} />
            </button>
          );
        })}
      </div>

      <Card className="border-gray-300/60 dark:border-zinc-700/60 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle className="text-lg flex items-center gap-2">
            {currentFilter === 'pending' ? <ListChecks className="w-5 h-5 text-orange-500" /> : <History className="w-5 h-5 text-orange-500" />}
            <span className="capitalize">{currentFilter}</span> Items
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-20">
              <ClipboardList className="w-12 h-12 text-muted/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No items found in this category.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredPlans.map((plan) => {
                const ui = getStatusUI(plan.status);
                const isOwnRequest = plan.userId?._id === userData.id;

                return (
                  <div key={plan._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-muted/30 transition-colors group gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl shrink-0 ${ui.color}`}>{ui.icon}</div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                           <span className="font-bold text-foreground">{plan.description}</span>
                           {plan.priority === 'urgent' && <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase">Urgent</span>}
                           {isOwnRequest && <span className="text-[9px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded-full font-bold border border-blue-200 uppercase">My Request</span>}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5 uppercase font-medium">
                          <span className="text-orange-500 font-bold">{plan.category?.name || "General"}</span>
                          <span className="opacity-30">•</span>
                          <span className="flex items-center gap-1">
                            <User2 className="w-3 h-3" />
                            {plan.userId?.username || "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <div className="font-black text-foreground text-lg">{plan.amount?.toLocaleString()} <span className="text-xs">Rwf</span></div>
                        <div className={`text-[10px] uppercase font-black ${plan.priority === 'urgent' ? 'text-red-500' : 'text-zinc-400'}`}>
                          {plan.priority} Priority
                        </div>
                      </div>

                      {/* ACTIONS: Manager can approve/reject anyone's request except their own (to avoid self-approval fraud) */}
                      {userData.role === "manager" && plan.status === "pending" && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleStatusUpdate(plan._id, 'approved')}
                            className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-90"
                            title="Approve"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(plan._id, 'rejected')}
                            className="p-2.5 bg-zinc-200 dark:bg-zinc-800 text-foreground rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-90"
                            title="Reject"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}

                      {/* DATE: Only show for finalized items */}
                      {plan.status !== "pending" && (
                        <div className="text-[10px] bg-muted px-2 py-1 rounded-lg text-muted-foreground font-bold">
                          {new Date(plan.updatedAt).toLocaleDateString('en-GB')}
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
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        categories={categories}
        onSuccess={fetchData}
      />
    </div>
  );
}