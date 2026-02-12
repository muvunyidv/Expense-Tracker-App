import { useState } from "react";
import { X } from "lucide-react";

const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .modal-overlay {
    animation: fadeIn 0.3s ease-out;
  }

  .modal-content {
    animation: slideUp 0.3s ease-out;
  }
`;

export function AddCategoryForm({ isOpen, onClose, onSubmit, existingCategories = [] }) {
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedCategory = newCategory.trim();

    if (!trimmedCategory) {
      setError("Category name cannot be empty");
      return;
    }

    if (
      existingCategories.some(
        (cat) => cat.toLowerCase() === trimmedCategory.toLowerCase()
      )
    ) {
      setError("This category already exists");
      return;
    }

    onSubmit(trimmedCategory);
    setNewCategory("");
    setError("");
  };

  const handleClose = () => {
    setNewCategory("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="modal-overlay fixed inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center z-50">
        <div className="modal-content bg-white dark:bg-white rounded-lg shadow-xl w-full max-w-md mx-4 border border-gray-200 dark:border-white">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-black">
              Add New Category
            </h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-muted rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Category Name Field */}
            <div>
              <label
                htmlFor="categoryInput"
                className="block text-sm font-medium mb-2 text-black dark:text-black"
              >
                Category Name *
              </label>
              <input
                id="categoryInput"
                type="text"
                value={newCategory}
                onChange={(e) => {
                  setNewCategory(e.target.value);
                  setError("");
                }}
                onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
                placeholder="Enter category name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-white text-black dark:text-black placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-black dark:text-black hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg bg-orange-500 text-white dark:bg-orange-500 hover:bg-orange-600 transition-colors font-medium"
              >
                Add Category
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
