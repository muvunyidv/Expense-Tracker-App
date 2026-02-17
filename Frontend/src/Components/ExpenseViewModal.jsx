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
      <div className="modal-overlay fixed inset-0 bg-black/60 flex items-center justify-center z-[60] backdrop-blur-sm">
        <div className="modal-content bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200 dark:border-zinc-800">
          
          {/* Header */}
          <div className="relative h-32 bg-orange-500 p-6 flex items-end">
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white truncate">
              {expense.description}
            </h2>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Amount Section */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Banknote className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Amount</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-white">
                  {expense.amount.toLocaleString()} <span className="text-sm font-medium">Rwf</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-white">Category</p>
                  <p className="text-sm text-white font-semibold">{expense.categoryId?.name || "Uncategorized"}</p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-white">Date</p>
                  <p className="text-sm text-white font-semibold">{new Date(expense.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-zinc-800" />

            {/* Description/Notes Section */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-gray-400">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Notes</span>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                  {expense.notes || "No additional notes provided for this expense."}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-3 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </>
  );
}