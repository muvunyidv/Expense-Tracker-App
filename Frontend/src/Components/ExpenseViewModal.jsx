import { X, Calendar, Tag, Banknote, Info, CheckCircle2, Clock } from "lucide-react";

const styles = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .modal-overlay { animation: fadeIn 0.3s ease-out; }
  .modal-content { animation: slideUp 0.3s ease-out; }
`;

export default function ExpenseViewModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  // Supports both Todo (task/cost) and Expense (description/amount) schemas
  const title = data.task || data.description || data.requestTitle || "Detail View";
  const amount = data.cost || data.amount || 0;
  const rawDate = data.startDate || data.date || data.createdAt;
  
  // Logic to determine if this is a Plan/Todo item
  const isPlan = !!data.task;
  const status = data.status || "pending";
  const isCompleted = status === "completed" || status === "approved";

  const formattedDate = (rawDate && rawDate !== "") 
    ? new Date(rawDate).toLocaleDateString('en-GB') 
    : "No Date Set";

  const category = data.categoryId?.name || data.category || (isPlan ? "Planned Strategy" : "General");
  const notes = data.notes || data.details || "No additional information provided.";

  return (
    <>
      <style>{styles}</style>
      <div className="modal-overlay fixed inset-0 bg-zinc-900/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
        <div className="modal-content bg-white text-zinc-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-zinc-100">
          
          {/* Header Section */}
          <div className="relative h-36 bg-orange-500 p-8 flex items-end">
            {/* Close Button - Top Right */}
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all z-50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Status Badge - Top Left (Only for Plans) */}
            {isPlan && (
              <div className="absolute top-7 left-8">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                  isCompleted 
                  ? "bg-green-500 text-white" 
                  : "bg-white/20 text-white border border-white/30 backdrop-blur-md"
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {status}
                </div>
              </div>
            )}

            <div className="space-y-1 w-full">
              <span className="text-[10px] font-black text-orange-100 uppercase tracking-widest">
                {isPlan ? "Pipeline Detail" : "Transaction Detail"}
              </span>
              <h2 className="text-xl font-black text-white truncate uppercase tracking-tight">{title}</h2>
            </div>
          </div>

          <div className="p-8 space-y-6 bg-white">
            {/* Amount Card */}
            <div className="flex items-center gap-5 p-4 bg-zinc-50 rounded-3xl border border-zinc-100">
              <div className="p-4 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/20">
                <Banknote className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-black mb-1">Financial Commitment</p>
                <p className="text-2xl font-black text-zinc-900">
                  {Number(amount).toLocaleString()} <span className="text-xs text-orange-500">RWF</span>
                </p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-zinc-100 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-[9px] text-zinc-400 font-black uppercase">Category</span>
                </div>
                <p className="text-xs font-bold text-zinc-800 truncate">{category}</p>
              </div>
              <div className="p-4 rounded-2xl border border-zinc-100 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-[9px] text-zinc-400 font-black uppercase">Start Date</span>
                </div>
                <p className="text-xs font-bold text-zinc-800">{formattedDate}</p>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-400">
                <Info className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase font-black tracking-widest">Notes</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-4 rounded-2xl border border-zinc-100 italic">
                "{notes}"
              </p>
            </div>

            {/* Action Button */}
            <button 
              onClick={onClose}
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-xl shadow-zinc-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </>
  );
}