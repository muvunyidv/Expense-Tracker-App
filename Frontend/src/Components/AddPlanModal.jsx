import { useState, useEffect } from "react";
import { X, ClipboardList, AlertCircle, Loader2, Banknote, Tag, MessageSquare, Edit3 } from "lucide-react";
import API from "../api";

export function AddPlanModal({ isOpen, onClose, categories = [], onSuccess, editData = null }) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "", 
    priority: "normal",
    notes: ""
  });
  const [loading, setLoading] = useState(false);

  // Determine if we are in Edit Mode
  const isEditing = !!editData;

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Pre-fill form with existing data for Editing
        setFormData({
          description: editData.description || "",
          amount: editData.amount || "",
          category: editData.category?._id || editData.category || "", 
          priority: editData.priority || "normal",
          notes: editData.notes || ""
        });
      } else {
        // Reset form for New Request
        setFormData({
          description: "",
          amount: "",
          category: "", 
          priority: "normal",
          notes: ""
        });
      }
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      alert("Please select a category");
      return;
    }
    
    setLoading(true);
    try {
      const submissionData = {
        ...formData,
        amount: Number(formData.amount),
        status: "pending",
        approvedAmount: Number(formData.amount) 
      };

      if (isEditing) {
        // Update existing plan using PATCH
        await API.patch(`/plans/${editData._id}`, submissionData);
      } else {
        // Create new plan using POST
        await API.post("/plans", submissionData);
      }

      onSuccess(); 
      onClose();   
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.response?.data?.error || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* White background for the modal container */}
      <div className="bg-white border border-zinc-200 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {/* Icon container always orange */}
              <div className="p-2 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/20">
                {isEditing ? <Edit3 className="w-5 h-5 text-white" /> : <ClipboardList className="w-5 h-5 text-white" />}
              </div>
              <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter">
                {isEditing ? "Edit Request" : "Submit Request"}
              </h3>
            </div>
            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-[0.2em] ml-1">
              {isEditing ? "Modify existing data" : "Spending Requirement"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Item / Objective</label>
            <div className="relative">
              <input
                required
                autoFocus
                className="w-full px-5 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-zinc-900 placeholder:text-zinc-400 font-medium"
                placeholder="What is this for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1 text-nowrap">Est. Cost (Rwf)</label>
              <div className="relative">
                <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="number"
                  required
                  className="w-full pl-11 pr-4 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:border-orange-500/50 outline-none transition-all text-zinc-900 font-bold"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>
            
            {/* Priority */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Priority</label>
              <select
                className="w-full px-4 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:border-orange-500/50 outline-none transition-all text-zinc-900 font-bold appearance-none cursor-pointer"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Budget Category</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <select
                required
                className="w-full pl-11 pr-4 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:border-orange-500/50 outline-none transition-all text-zinc-900 font-bold appearance-none cursor-pointer"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Supporting Notes</label>
             <div className="relative">
                <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-zinc-400" />
                <textarea 
                  className="w-full pl-11 pr-4 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:border-orange-500/50 outline-none transition-all text-zinc-900 text-sm"
                  placeholder="Explain why this is needed..."
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
             </div>
          </div>

          {/* Button always uses the orange theme */}
          <button
            type="submit"
            disabled={loading || categories.length === 0}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-200 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 mt-4 uppercase text-xs tracking-[0.2em]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? "Update Request" : "Send Request")}
          </button>
        </form>
      </div>
    </div>
  );
}