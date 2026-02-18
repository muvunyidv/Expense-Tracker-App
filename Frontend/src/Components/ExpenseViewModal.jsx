import { X, Calendar, Tag, Banknote, FileText } from "lucide-react";

const styles = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .modal-overlay { animation: fadeIn 0.3s ease-out; }
  .modal-content { animation: slideUp 0.3s ease-out; }
`;

export function ExpenseViewModal({ isOpen, onClose, expense }) {
  if (!isOpen || !expense) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="modal-overlay fixed inset-0 bg-black/60 flex items-center justify-center z-[60] backdrop-blur-sm p-4">
        {/* FIX: Explicitly using bg-white for Light Mode 
            This overrides any global dark background issues.
        */}
        <div className="modal-content bg-white dark:bg-[#121417] text-zinc-900 dark:text-zinc-100 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-all duration-300">
          
          {/* Header: Always Orange */}
          <div className="relative h-40 bg-orange-500 p-8 flex items-end">
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-3xl font-black text-white truncate tracking-tight">
              {expense.description}
            </h2>
          </div>

          {/* Body: Force Light/Dark differentiation */}
          <div className="p-8 space-y-8 bg-white ">
            
            {/* Amount Section */}
            <div className="flex items-center gap-5">
              <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-2xl">
                <Banknote className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 dark:text-black uppercase tracking-widest font-black mb-1">Total Spent</p>
                <p className="text-2xl font-black text-black flex items-baseline gap-2">
                  {expense.amount.toLocaleString()} 
                  <span className="text-sm font-bold text-zinc-400 uppercase">Rwf</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Category */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-50 dark:bg-white rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
                   <Tag className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 dark:text-black uppercase font-black">Category</p>
                  <p className="text-sm text-black font-bold">{expense.categoryId?.name || "Uncategorized"}</p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-50 dark:bg-white rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
                   <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 dark:text-black uppercase font-black">Date</p>
                  <p className="text-sm text-black  font-bold">{new Date(expense.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* Notes */}
            <div>
              <div className="flex items-center gap-2 mb-3 text-zinc-400">
                <FileText className="w-4 h-4" />
                <span className="text-[10px] text-black uppercase tracking-widest">Notes</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/30 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                <p className="text-sm text-zinc-600 dark:text-black italic leading-relaxed">
                  {expense.notes || "No additional notes."}
                </p>
              </div>
            </div>

            {/* Footer Button: High Contrast */}
            <button 
              onClick={onClose}
              className="w-full py-4 bg-zinc-900 dark:bg-black text-white dark:text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.98] shadow-xl shadow-zinc-200 dark:shadow-none"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </>
  );
}