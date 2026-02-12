import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import { AddCategoryForm } from "../Components/AddCategoryForm";

const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Entertainment",
  "Shopping",
  "Utilities",
  "Healthcare",
  "Other",
];

export function Categories() {
  const [categories, setCategories] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(false);

  // Track theme changes
  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    updateTheme();
    
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Load categories from localStorage on mount
  useEffect(() => {
    const savedCategories = localStorage.getItem("categories");
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem("categories", JSON.stringify(DEFAULT_CATEGORIES));
    }
  }, []);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  const handleAddCategory = (categoryName) => {
    setCategories([...categories, categoryName]);
    setIsAdding(false);
    setError("");
  };

  const handleDeleteCategory = (categoryToDelete) => {
    // Don't allow deleting default categories
    if (DEFAULT_CATEGORIES.includes(categoryToDelete)) {
      setError("Cannot delete default categories");
      return;
    }

    setCategories(categories.filter((cat) => cat !== categoryToDelete));
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Categories</h2>
          <p className="text-muted-foreground mt-1">
            Manage your expense categories
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors ${
            isDark ? 'bg-white text-black' : 'bg-black text-white'
          }`}
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Add Category Modal */}
      <AddCategoryForm
        isOpen={isAdding}
        onClose={() => {
          setIsAdding(false);
          setError("");
        }}
        onSubmit={handleAddCategory}
        existingCategories={categories}
      />

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <div className="col-span-full p-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No categories yet. Add one to get started!
            </p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {category}
              </span>
              {!DEFAULT_CATEGORIES.includes(category) && (
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  aria-label="Delete category"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
