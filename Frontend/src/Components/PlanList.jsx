import { useState, useEffect } from "react";
import {
  ListChecks,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Loader2,
  ClipboardList,
  Check,
  X,
  History,
  User2,
  MessageSquare,
  Edit3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import { AddPlanModal } from "./AddPlanModal";
import ExpenseViewModal from "../Components/ExpenseViewModal"; 
import API from "../api";

export function PlanList() {
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState({ role: "staff", id: null });
  const [currentFilter, setCurrentFilter] = useState("pending");

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [decisionMode, setDecisionMode] = useState(null); 
  const [decisionData, setDecisionData] = useState({ amount: 0, comment: "" });

  useEffect(() => {
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
        API.get("/categories"),
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
      const payload = {
        status: newStatus,
        approvedAmount: newStatus === "approved" ? decisionData.amount : 0,
        managerComment: decisionData.comment,
      };

      await API.patch(`/plans/${id}/status`, payload);

      if (newStatus === "approved") {
        window.dispatchEvent(new Event("expensesUpdated"));
      }

      setDecisionMode(null);
      setDecisionData({ amount: 0, comment: "" });
      fetchData();
    } catch (error) {
      alert("Action failed: Check your permissions.");
    }
  };

  const getStatusUI = (status) => {
    const s = status?.toLowerCase().trim();
    switch (s) {
      case "approved":
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          color: "text-green-500 bg-green-500/10",
          label: "Approved",
        };
      case "rejected":
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: "text-red-500 bg-red-500/10",
          label: "Rejected",
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          color: "text-amber-500 bg-amber-500/10",
          label: "Pending",
        };
    }
  };

  const filteredPlans = plans.filter(
    (p) => p.status?.toLowerCase().trim() === currentFilter.toLowerCase().trim()
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
            {userData.role === "manager" ? "Approval Queue" : "My Requests"}
          </h1>
          <p className="text-sm text-muted-foreground italic">
            {userData.role === "manager"
              ? "Authorize expenditures or adjust amounts"
              : "Track your funding requests"}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-orange-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" /> New Request
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: "pending", label: "Pending", icon: Clock, color: "amber" },
          { id: "approved", label: "Approved", icon: CheckCircle2, color: "green" },
          { id: "rejected", label: "Rejected", icon: XCircle, color: "red" },
        ].map((card) => {
          const Icon = card.icon;
          const isActive = currentFilter === card.id;
          const count = plans.filter((p) => p.status?.toLowerCase().trim() === card.id).length;

          return (
            <button
              key={card.id}
              onClick={() => setCurrentFilter(card.id)}
              className={`p-4 border rounded-2xl flex justify-between items-center transition-all text-left ${
                isActive
                  ? `bg-orange-500/10 border-orange-500 shadow-md`
                  : "bg-muted/50 border-transparent hover:bg-muted"
              }`}
            >
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? `text-orange-600` : "text-muted-foreground"}`}>
                  {card.label}
                </span>
                <div className="text-2xl font-black text-foreground">{count}</div>
              </div>
              <Icon className={`w-8 h-8 ${isActive ? `text-orange-500` : "text-muted-foreground/30"}`} />
            </button>
          );
        })}
      </div>

      {/* Main List */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden rounded-[2rem]">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle className="text-lg flex items-center gap-2">
            {currentFilter === "pending" ? (
              <ListChecks className="w-5 h-5 text-orange-500" />
            ) : (
              <History className="w-5 h-5 text-orange-500" />
            )}
            <span className="capitalize">{currentFilter}</span> Items
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-20">
              <ClipboardList className="w-12 h-12 text-muted/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Clear queue.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredPlans.map((plan) => {
                const ui = getStatusUI(plan.status);
                const isEditing = decisionMode === plan._id;
                const statusNormalized = plan.status?.toLowerCase().trim();

                return (
                  <div 
                    key={plan._id} 
                    onClick={() => {
                        if (!isEditing) {
                            const categoryName = typeof plan.category === 'object' 
                                ? plan.category?.name 
                                : (plan.categoryId?.name || plan.category || "General");

                            setSelectedPlan({
                                ...plan,
                                task: plan.description, 
                                cost: plan.status === 'approved' ? plan.approvedAmount : plan.amount,      
                                category: categoryName,
                                notes: plan.managerComment || plan.notes || "No additional information provided."
                            });
                            setIsViewModalOpen(true);
                        }
                    }}
                    className="flex flex-col p-5 hover:bg-orange-50/30 dark:hover:bg-zinc-800/40 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110 ${ui.color}`}>
                          {ui.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-foreground group-hover:text-orange-600 transition-colors">
                              {plan.description}
                            </span>
                            {plan.priority === "urgent" && (
                              <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase">
                                Urgent
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5 uppercase font-medium">
                            <span className="text-orange-500 font-bold">
                                {plan.category?.name || plan.category || "General"}
                            </span>
                            <span className="opacity-30">•</span>
                            <span className="flex items-center gap-1">
                              <User2 className="w-3 h-3" /> {plan.userId?.username}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="text-left sm:text-right">
                          <div className="text-[10px] text-muted-foreground uppercase font-bold">Requested</div>
                          <div className={`font-black text-lg ${statusNormalized === "approved" && plan.approvedAmount < plan.amount ? "line-through opacity-50 text-sm" : "text-foreground"}`}>
                            {plan.amount?.toLocaleString()} Rwf
                          </div>
                          {statusNormalized === "approved" && plan.approvedAmount < plan.amount && (
                            <div className="font-black text-green-600 text-lg">
                              {plan.approvedAmount?.toLocaleString()} Rwf
                            </div>
                          )}
                        </div>

                        {userData.role === "manager" && statusNormalized === "pending" && !isEditing && (
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setDecisionMode(plan._id);
                                setDecisionData({ amount: plan.amount, comment: "" });
                              }}
                              className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 active:scale-90 transition-all"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(plan._id, "rejected")}
                              className="p-2.5 bg-zinc-200 dark:bg-zinc-800 text-foreground rounded-xl hover:bg-red-500 hover:text-white active:scale-90 transition-all"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {plan.managerComment && (
                        <div className="mt-3 ml-14 p-2 px-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg flex items-start gap-2 max-w-2xl">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium italic">
                                "{plan.managerComment}" — Reviewed by Manager
                            </p>
                        </div>
                    )}

                    {isEditing && (
                      <div className="mt-4 p-8 bg-white dark:bg-white rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in slide-in-from-top-4 duration-300 relative z-10" onClick={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block ml-1 tracking-widest">Approve Amount (Rwf)</label>
                            <div className="relative">
                              <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                              <input
                                type="number"
                                value={decisionData.amount === 0 ? "" : decisionData.amount}
                                placeholder="Enter approved amount..."
                                onChange={(e) => setDecisionData({ ...decisionData, amount: e.target.value === "" ? 0 : Number(e.target.value) })}
                                className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-white border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-zinc-900 dark:text-black focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block ml-1 tracking-widest">Manager Comment</label>
                            <div className="relative">
                              <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                              <input
                                type="text"
                                placeholder="Add a reason for this amount..."
                                value={decisionData.comment}
                                onChange={(e) => setDecisionData({ ...decisionData, comment: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-white border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-black font-medium focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all placeholder:text-zinc-400"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end items-center gap-6 mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                          <button onClick={() => setDecisionMode(null)} className="px-4 py-2 text-[10px] font-black uppercase text-zinc-400 hover:text-red-500 tracking-widest transition-colors">Cancel</button>
                          <button onClick={() => handleStatusUpdate(plan._id, "approved")} className="px-10 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-95 transition-all">Confirm Approval</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ExpenseViewModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        data={selectedPlan}
      />

      <AddPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        onSuccess={fetchData}
      />
    </div>
  );
}