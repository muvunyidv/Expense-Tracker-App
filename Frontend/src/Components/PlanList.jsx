import { useState, useEffect } from "react";
import {
  ListChecks,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Loader2,
  Check,
  X,
  History,
  User2,
  Edit3,
  Trash2,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import { AddPlanModal } from "./AddPlanModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import API from "../api";

export function PlanList() {
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState({ role: "staff", id: null });
  const [currentFilter, setCurrentFilter] = useState("pending");

  // State for Edit Mode
  const [planToEdit, setPlanToEdit] = useState(null);

  // State for Manager Approval
  const [decisionMode, setDecisionMode] = useState(null); 
  const [decisionData, setDecisionData] = useState({ amount: 0, comment: "" });

  // State for Custom Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleConfirmDelete = async () => {
    if (!planToDelete?._id) return;
    setIsDeleting(true);
    try {
      await API.delete(`/plans/${planToDelete._id}`);
      setPlans((prev) => prev.filter((p) => p._id !== planToDelete._id));
      setDeleteModalOpen(false);
      setPlanToDelete(null);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete request.");
    } finally {
      setIsDeleting(false);
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
        return { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-green-500 bg-green-500/10", label: "Approved" };
      case "rejected":
        return { icon: <XCircle className="w-4 h-4" />, color: "text-red-500 bg-red-500/10", label: "Rejected" };
      default:
        return { icon: <Clock className="w-4 h-4" />, color: "text-amber-500 bg-amber-500/10", label: "Pending" };
    }
  };

  // Helper for Priority styling
  const getPriorityUI = (priority) => {
    const p = priority?.toLowerCase().trim();
    switch (p) {
      case "urgent":
        return "bg-red-500/10 text-red-600 border-red-200";
      case "normal":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "low":
        return "bg-slate-500/10 text-slate-600 border-slate-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  const filteredPlans = plans.filter(
    (p) => p.status?.toLowerCase().trim() === currentFilter.toLowerCase().trim()
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
            {userData.role === "manager" ? "Approval Queue" : "My Requests"}
          </h1>
          <p className="text-sm text-muted-foreground italic">
            {userData.role === "manager" ? "Authorize expenditures" : "Track your funding requests"}
          </p>
        </div>
        <button
          onClick={() => {
            setPlanToEdit(null); 
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-orange-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" /> New Request
        </button>
      </div>

      {/* Filter Tabs */}
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
                isActive ? `bg-${card.color}-500/10 border-${card.color}-500 shadow-lg` : "bg-muted/50 border-transparent"
              }`}
            >
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? `text-${card.color}-600` : "text-muted-foreground"}`}>
                  {card.label}
                </span>
                <div className="text-2xl font-black text-foreground">{count}</div>
              </div>
              <Icon className={`w-8 h-8 ${isActive ? `text-${card.color}-500` : "text-muted-foreground/30"}`} />
            </button>
          );
        })}
      </div>

      <Card className="border-gray-300/60 dark:border-zinc-700/60 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle className="text-lg flex items-center gap-2">
            {currentFilter === "pending" ? <ListChecks className="w-5 h-5 text-orange-500" /> : <History className="w-5 h-5 text-orange-500" />}
            <span className="capitalize">{currentFilter}</span> Items
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground font-medium">Clear queue.</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredPlans.map((plan) => {
                const ui = getStatusUI(plan.status);
                const isEditingDecision = decisionMode === plan._id;
                const isPending = plan.status?.toLowerCase().trim() === "pending";

                return (
                  <div key={plan._id} className="flex flex-col p-5 hover:bg-muted/30 transition-colors gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl shrink-0 ${ui.color}`}>{ui.icon}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{plan.description}</span>
                            {/* PRIORITY TAG */}
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-black uppercase tracking-tighter ${getPriorityUI(plan.priority)}`}>
                              {plan.priority || "Normal"}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground uppercase font-medium">
                            <span className="text-orange-500 font-bold">{plan.category?.name}</span> • <User2 className="w-3 h-3 inline pb-0.5" /> {plan.userId?.username}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="text-left sm:text-right font-black text-lg">
                          {plan.amount?.toLocaleString()} Rwf
                        </div>

                        <div className="flex items-center gap-2">
                          {userData.role === "manager" && isPending && !isEditingDecision && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setDecisionMode(plan._id); setDecisionData({ amount: plan.amount, comment: "" }); }}
                                className="p-2.5 bg-green-600 text-white rounded-xl shadow-lg active:scale-90 transition-all"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(plan._id, "rejected")}
                                className="p-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-xl hover:bg-red-500 hover:text-white active:scale-90 transition-all"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          )}

                          {userData.role === "staff" && isPending && (
                            <div className="flex gap-1 ml-2 pl-4 border-l border-zinc-200">
                              <button 
                                onClick={() => {
                                  setPlanToEdit(plan);
                                  setIsModalOpen(true);
                                }}
                                className="p-2.5 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all active:scale-90"
                                title="Edit Request"
                              >
                                <Edit3 className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => { setPlanToDelete(plan); setDeleteModalOpen(true); }}
                                className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                                title="Delete Request"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {isEditingDecision && (
                      <div className="mt-4 p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl animate-in slide-in-from-top-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <input
                            type="number"
                            value={decisionData.amount === 0 ? "" : decisionData.amount}
                            placeholder="Approve Amount..."
                            onChange={(e) => setDecisionData({ ...decisionData, amount: Number(e.target.value) })}
                            className="w-full px-4 py-4 bg-zinc-50 dark:bg-zinc-800 border dark:border-zinc-700 rounded-2xl font-bold outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Manager comment..."
                            value={decisionData.comment}
                            onChange={(e) => setDecisionData({ ...decisionData, comment: e.target.value })}
                            className="w-full px-4 py-4 bg-zinc-50 dark:bg-zinc-800 border dark:border-zinc-700 rounded-2xl outline-none"
                          />
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                          <button onClick={() => setDecisionMode(null)} className="text-[10px] font-black uppercase text-zinc-400">Cancel</button>
                          <button onClick={() => handleStatusUpdate(plan._id, "approved")} className="px-10 py-4 bg-green-500 text-white rounded-[1.2rem] text-[10px] font-black uppercase">Confirm</button>
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

      <AddPlanModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setPlanToEdit(null);
        }} 
        categories={categories} 
        onSuccess={fetchData} 
        editData={planToEdit} 
      />

      <DeleteConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => { 
          setDeleteModalOpen(false); 
          setPlanToDelete(null); 
        }}
        onConfirm={handleConfirmDelete}
        itemName={planToDelete?.description || ""}
        loading={isDeleting}
      />
    </div>
  );
}