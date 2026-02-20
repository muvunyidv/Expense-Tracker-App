import { useState, useEffect } from "react";
import { X, ClipboardList, AlertCircle, Loader2 } from "lucide-react";
import API from "../api";

export function AddPlanModal({ isOpen, onClose, categories = [], onSuccess }) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    priority: "normal",
    notes: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log("AddPlanModal received categories:", categories);
    }
  }, [isOpen, categories]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        description: "",
        amount: "",
        category: "",
        priority: "normal",
        notes: ""
      });
    }
  }, [isOpen]);

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
        status: "pending"
      };

      await API.post("/plans", submissionData);
      onSuccess(); 
      onClose();   
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.response?.data?.error || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      {/* Changed border-border to border-zinc-200/50 for softer lines */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 w-full max-w-md rounded-[32px] shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header - Softer Background */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-orange-50/30 dark:bg-orange-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-xl">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-none">New Requirement</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1.5 opacity-70">Household & Business</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Item Description */}
          <div>
            <label className="text-[10px] font-black mb-2 block uppercase text-zinc-500 tracking-wider">Item Description</label>
            <input
              required
              autoFocus
              className="w-full px-4 py-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all dark:text-white placeholder:text-zinc-400"
              placeholder="e.g. 5kg Sugar or Toilet Paper"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black mb-2 block uppercase text-zinc-500 tracking-wider">Est. Cost (Rwf)</label>
              <input
                type="number"
                required
                className="w-full px-4 py-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all dark:text-white"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-[10px] font-black mb-2 block uppercase text-zinc-500 tracking-wider">Priority</label>
              <select
                className="w-full px-4 py-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all dark:text-white "
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Category Dropdown - Fix for visibility and empty state */}
          <div>
            <label className="text-[10px] font-black mb-2 block uppercase text-zinc-500 tracking-wider">Category</label>
            <div className="relative">
              <select
                required
                className="w-full px-4 py-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all dark:text-white "
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="" className="text-zinc-900 dark:text-white">
                   {categories.length > 0 ? "Select Category" : "--- No Categories Found ---"}
                </option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name} className="text-zinc-900 dark:text-white bg-white dark:bg-zinc-900">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Soft Alert */}
            {categories.length === 0 && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-[10px] font-bold text-red-600/80 dark:text-red-400 uppercase tracking-tight">
                  Error: API failed to load categories.
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || categories.length === 0}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98] mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Request"}
          </button>
        </form>
      </div>
    </div>
  );
}