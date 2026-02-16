import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

const styles = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .modal-overlay { animation: fadeIn 0.3s ease-out; }
  .modal-content { animation: slideUp 0.3s ease-out; }
`;

export function AddExpenseForm({ isOpen, onClose, onSubmit, categories = [] }) {
  const [formData, setFormData] = useState({
    amount: "",
    categoryId: "",
    description: "", // Mapping to your 'Title' input
    notes: "",       // The new separate description/notes field
    date: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Sync categoryId when categories load or modal opens
  // Fix: Always default to categories[0] to ensure the first DB entry is selected
  useEffect(() => {
    if (isOpen && categories.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        categoryId: categories[0]._id 
      }));
    }
  }, [isOpen, categories]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.description.trim()) newErrors.description = "Title is required";
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = "Invalid amount";
    if (!formData.categoryId) newErrors.categoryId = "Please select a category";
    if (!formData.date) newErrors.date = "Date is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
      });

      // Reset form
      setFormData({
        amount: "",
        categoryId: categories[0]?._id || "",
        description: "",
        notes: "",
        date: new Date().toISOString().split("T")[0],
      });
      onClose();
    } catch (err) {
      setErrors({ server: "Failed to save expense." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="modal-overlay fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="modal-content bg-white rounded-lg shadow-xl w-full max-w-md mx-4 border border-gray-200">
          
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Add New Expense</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Expense Title *</label>
              <input 
                type="text" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" 
                placeholder="e.g. Grocery Shopping" 
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Separate Description Field (Notes) */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Description / Notes</label>
              <textarea 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none" 
                placeholder="Add more details here..." 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Amount *</label>
                <input 
                  type="number" 
                  name="amount" 
                  value={formData.amount} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" 
                  placeholder="0.00" 
                />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Date *</label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Category *</label>
              <select 
                name="categoryId" 
                value={formData.categoryId} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
              >
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))
                ) : (
                  <option value="" disabled>Loading categories...</option>
                )}
              </select>
            </div>

            {errors.server && <p className="text-red-500 text-sm text-center">{errors.server}</p>}

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button 
                type="submit" 
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex justify-center items-center shadow-md active:scale-95 disabled:opacity-70"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add Expense"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}