import { useState, useEffect } from "react";
import { Trash2, Plus, Loader2, Pencil } from "lucide-react"; // Added Pencil
import { AddCategoryForm } from "../Components/AddCategoryForm";
import API from "../api";

export function Categories({ onCategoriesChange }) {
  const [categories, setCategories] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // Track category being edited
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      setError("Failed to load categories from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsAdding(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setIsAdding(true);
  };

  const handleCategorySaved = () => {
    fetchCategories(); // Re-fetch all to ensure sync
    setIsAdding(false);
    setEditingCategory(null);
    if (onCategoriesChange) onCategoriesChange();
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await API.delete(`/categories/${id}`);
      setCategories(categories.filter((cat) => cat._id !== id));
      if (onCategoriesChange) onCategoriesChange();
    } catch (err) {
      setError("Could not delete category.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-black dark:text-white">Categories</h2>
          <p className="text-muted-foreground mt-1">Manage your expense categories</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors bg-orange-500 text-white"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      <AddCategoryForm
        isOpen={isAdding}
        onClose={() => { setIsAdding(false); setEditingCategory(null); }}
        onCategoryAdded={handleCategorySaved}
        initialData={editingCategory} // Ensure your Form component accepts this
      />

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.length === 0 ? (
            <div className="col-span-full p-8 rounded-lg border-2 border-dashed border-gray-300 text-center">
              <p className="text-gray-500">No categories yet.</p>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category._id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 flex items-center justify-between hover:shadow-md transition-all group"
              >
                <div className="truncate mr-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100 block truncate">
                    {category.name}
                  </span>
                  {category.description && (
                    <span className="text-xs text-gray-500 truncate block">{category.description}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                  {/* EDIT BUTTON */}
                  <button
                    onClick={() => handleOpenEdit(category)}
                    className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    aria-label="Edit category"
                  >
                    <Pencil className="w-4 h-4 text-blue-500" />
                  </button>

                  {/* DELETE BUTTON */}
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    aria-label="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}