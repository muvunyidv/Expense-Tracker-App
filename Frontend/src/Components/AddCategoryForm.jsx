import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import API from "../api";

const styles = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .modal-overlay { animation: fadeIn 0.3s ease-out; }
  .modal-content { animation: slideUp 0.3s ease-out; }
`;

export function AddCategoryForm({ isOpen, onClose, onCategoryAdded, initialData }) {
  const [newCategory, setNewCategory] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync state with initialData whenever the modal opens or the item changes
  useEffect(() => {
    if (initialData) {
      setNewCategory(initialData.name || "");
      setDescription(initialData.description || "");
    } else {
      setNewCategory("");
      setDescription("");
    }
    setError("");
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedCategory = newCategory.trim();

    if (!trimmedCategory) {
      setError("Category name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setError("");

      let response;
      if (initialData) {
        // UPDATE MODE
        response = await API.put(`/categories/${initialData._id}`, {
          name: trimmedCategory,
          description: description.trim(),
        });
      } else {
        // CREATE MODE
        response = await API.post("/categories", {
          name: trimmedCategory,
          description: description.trim(),
        });
      }

      onCategoryAdded(response.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save category.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewCategory("");
    setDescription("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="modal-overlay fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="modal-content bg-white rounded-lg shadow-xl w-full max-w-md mx-4 border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {initialData ? "Edit Category" : "Add New Category"}
            </h2>
            <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-md transition-colors">
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="categoryInput" className="block text-sm font-medium mb-2 text-black">
                Category Name *
              </label>
              <input
                id="categoryInput"
                type="text"
                value={newCategory}
                onChange={(e) => { setNewCategory(e.target.value); setError(""); }}
                placeholder="e.g., Groceries, Rent, Utilities"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-50"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="descriptionInput" className="block text-sm font-medium mb-2 text-black">
                Description (Optional)
              </label>
              <textarea
                id="descriptionInput"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this category for?"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-50 h-20 resize-none"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-black hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : initialData ? (
                  "Update Category"
                ) : (
                  "Add Category"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}