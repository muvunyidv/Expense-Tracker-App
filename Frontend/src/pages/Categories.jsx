import { useState, useEffect } from "react";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { AddCategoryForm } from "../Components/AddCategoryForm";
import API from "../api";

export function Categories() {
  const [categories, setCategories] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Fetch categories from the Backend
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get("/categories");
      setCategories(res.data); // res.data is now an array of objects [{_id, name, description}]
    } catch (err) {
      setError("Failed to load categories from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Refresh when a new category is added via the modal
  const handleCategoryAdded = (newCategoryObj) => {
    setCategories((prev) => [...prev, newCategoryObj]);
    setIsAdding(false);
  };

  // 3. Delete from Backend
  const handleDeleteCategory = async (id) => {
    try {
      await API.delete(`/categories/${id}`);
      setCategories(categories.filter((cat) => cat._id !== id));
      setError("");
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
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors bg-orange-500 text-white"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <AddCategoryForm
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        onCategoryAdded={handleCategoryAdded} // Pass the new success handler
      />

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.length === 0 ? (
            <div className="col-span-full p-8 rounded-lg border-2 border-dashed border-gray-300 text-center">
              <p className="text-gray-500">No categories yet. Add one to get started!</p>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category._id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 flex items-center justify-between hover:shadow-md transition-all"
              >
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100 block">
                    {category.name}
                  </span>
                  {category.description && (
                    <span className="text-xs text-gray-500">{category.description}</span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteCategory(category._id)}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  aria-label="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}