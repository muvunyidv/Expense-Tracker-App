import { useState, useEffect, useCallback } from "react";
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

  // Broadcast Tab Changes specifically for Sidebar calculation logic
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("tabChanged", { detail: currentFilter }));
  }, [currentFilter]);

  // Fetch data with centralized calculation logic
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [plansRes, catsRes] = await Promise.all([
        API.get("/plans"),
        API.get("/categories"),
      ]);
      
      const plansData = plansRes.data || [];
      setPlans(plansData);
      setCategories(catsRes.data || []);

      // CALCULATE TOTALS FOR SIDEBAR
      const plansByStatus = {
        pending: plansData
          .filter(p => p.status?.toLowerCase().trim() === "pending")
          .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
        
        approved: plansData
          .filter(p => p.status?.toLowerCase().trim() === "approved")
          .reduce((acc, curr) => {
            const val = (Number(curr.approvedAmount) > 0) ? Number(curr.approvedAmount) : Number(curr.amount);
            return acc + (val || 0);
          }, 0),
        
        rejected: plansData
          .filter(p => p.status?.toLowerCase().trim() === "rejected")
          .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
      };

      // Broadcast update to Sidebar
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("plansUpdated", { 
          detail: { plansByStatus } 
        }));
        window.dispatchEvent(new CustomEvent("tabChanged", { detail: currentFilter }));
      }, 50);

    } catch (error) {
      // Silent error handling for production
    } finally {
      setLoading(false);
    }
  }, [currentFilter]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserData({ role: payload.role || "staff", id: payload.id });
      } catch (e) {
        // Token parse error handling
      }
    }
    fetchData();
  }, [fetchData]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const payload = {
        status: newStatus,
        approvedAmount: newStatus === "approved" ? Number(decisionData.amount) : 0,
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
        return { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-green-500 bg-green-500/10", label: "Approved" };
      case "rejected":
        return { icon: <XCircle className="w-4 h-4" />, color: "text-red-500 bg-red-500/10", label: "Rejected" };
      default:
        return { icon: <Clock className="w-4 h-4" />, color: "text-amber-500 bg-amber-500/10", label: "Pending" };
    }
  };

  const filteredPlans = plans.filter(
    (p) => p.status?.toLowerCase().trim() === currentFilter.toLowerCase().trim()
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 uppercase">
            {userData.role === "manager" ? "Approval Queue" : "My Requests"}
          </h1>
          <p className="text-sm text-zinc-500 italic">
            {userData.role === "manager" ? "Authorize expenditures or adjust amounts" : "Track your funding requests"}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-orange-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" /> New Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: "pending", label: "Pending", icon: Clock },
          { id: "approved", label: "Approved", icon: CheckCircle2 },
          { id: "rejected", label: "Rejected", icon: XCircle },
        ].map((card) => {
          const Icon = card.icon;
          const isActive = currentFilter === card.id;
          const count = plans.filter((p) => p.status?.toLowerCase().trim() === card.id).length;

          return (
            <button
              key={card.id}
              onClick={() => setCurrentFilter(card.id)}
              className={`p-4 border rounded-2xl flex justify-between items-center transition-all text-left ${
                isActive ? `bg-white border-orange-300 shadow-xl ring-1 ring-orange-200` : "bg-zinc-50 border-transparent hover:bg-zinc-100"
              }`}
            >
              <div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? `text-zinc-900` : "text-zinc-400"}`}>{card.label}</span>
                <div className={`text-2xl font-black ${isActive ? 'text-zinc-900' : 'text-zinc-500'}`}>{count}</div>
              </div>
              <Icon className={`w-8 h-8 ${isActive ? `text-orange-500` : "text-zinc-200"}`} />
            </button>
          );
        })}
      </div>

      <Card className="border-zinc-200 shadow-xl overflow-hidden rounded-[2rem] bg-white">
        <CardHeader className="border-b border-zinc-50 bg-zinc-50/30">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-400">
            {currentFilter === "pending" ? <ListChecks className="w-4 h-4 text-orange-500" /> : <History className="w-4 h-4 text-orange-500" />}
            {currentFilter} Items
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-20">
              <ClipboardList className="w-12 h-12 text-zinc-100 mx-auto mb-4" />
              <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Queue is empty</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {filteredPlans.map((plan) => {
                const ui = getStatusUI(plan.status);
                const isEditing = decisionMode === plan._id;
                const statusNormalized = plan.status?.toLowerCase().trim();
                const isAmountChanged = statusNormalized === "approved" && plan.approvedAmount && Number(plan.approvedAmount) !== Number(plan.amount);

                return (
                  <div 
                    key={plan._id} 
                    onClick={() => {
                        if (!isEditing) {
                            const categoryName = typeof plan.category === 'object' ? plan.category?.name : (plan.categoryId?.name || plan.category || "General");
                            setSelectedPlan({
                                ...plan,
                                task: plan.description, 
                                cost: plan.status === 'approved' ? (plan.approvedAmount || plan.amount) : plan.amount,      
                                category: categoryName,
                                endDate: plan.endDate,
                                notes: plan.managerComment || plan.notes || "No additional information provided."
                            });
                            setIsViewModalOpen(true);
                        }
                    }}
                    className="flex flex-col p-6 hover:bg-zinc-50/50 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110 ${ui.color}`}>{ui.icon}</div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-zinc-900 uppercase text-sm tracking-tight group-hover:text-orange-600 transition-colors">{plan.description}</span>
                            {plan.priority === "urgent" && <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase">Urgent</span>}
                          </div>
                          <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-1 uppercase font-black tracking-widest">
                            <span className="text-orange-500">{plan.category?.name || plan.category || "General"}</span>
                            <span className="opacity-30">•</span>
                            <span className="flex items-center gap-1"><User2 className="w-3 h-3" /> {plan.userId?.username}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="text-left sm:text-right">
                          <div className="text-[9px] text-zinc-400 uppercase font-black tracking-widest mb-1">Amount</div>
                          <div className={`font-black text-lg tracking-tighter transition-all ${isAmountChanged ? "line-through opacity-30 text-sm" : "text-zinc-900"}`}>
                            {Number(plan.amount).toLocaleString()} <span className="text-[10px] text-zinc-400">RWF</span>
                          </div>
                          {isAmountChanged && (
                            <div className="font-black text-lg tracking-tighter text-orange-600">
                              {Number(plan.approvedAmount).toLocaleString()} <span className="text-[10px]">RWF</span>
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
                              className="p-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-lg active:scale-90 transition-all"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(plan._id, "rejected")}
                              className="p-3 bg-zinc-100 text-zinc-400 rounded-xl hover:bg-red-500 hover:text-white active:scale-90 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {plan.managerComment && (
                        <div className="mt-4 ml-14 p-3 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-start gap-3 max-w-2xl">
                            <MessageSquare className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-zinc-500 font-bold italic tracking-tight">"{plan.managerComment}"</p>
                        </div>
                    )}

                    {isEditing && (
                      <div className="mt-6 p-8 bg-white rounded-[2rem] border-2 border-orange-200 shadow-2xl animate-in zoom-in-95 duration-200 relative z-10" onClick={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-400 mb-2 block ml-1 tracking-widest">Final Amount (Rwf)</label>
                            <div className="relative">
                              <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                              <input
                                type="number"
                                value={decisionData.amount === 0 ? "" : decisionData.amount}
                                placeholder="0.00"
                                onChange={(e) => setDecisionData({ ...decisionData, amount: e.target.value === "" ? 0 : Number(e.target.value) })}
                                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-black text-zinc-900 focus:ring-0 focus:border-orange-500 outline-none transition-all"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-400 mb-2 block ml-1 tracking-widest">Decision Note</label>
                            <div className="relative">
                              <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                              <input
                                type="text"
                                placeholder="Add a reason..."
                                value={decisionData.comment}
                                onChange={(e) => setDecisionData({ ...decisionData, comment: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-900 font-bold focus:ring-0 focus:border-orange-500 outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end items-center gap-4 mt-8 pt-6 border-t border-zinc-50">
                          <button onClick={() => setDecisionMode(null)} className="text-[10px] font-black uppercase text-zinc-400 hover:text-red-500 tracking-widest transition-colors">Cancel</button>
                          <button onClick={() => handleStatusUpdate(plan._id, "approved")} className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">Confirm Decision</button>
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

      <ExpenseViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} data={selectedPlan} />
      <AddPlanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} categories={categories} onSuccess={fetchData} />
    </div>
  );
}
