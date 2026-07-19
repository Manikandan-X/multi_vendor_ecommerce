import { useState } from "react";
import { useCategories, useDeleteCategory } from "../../hooks/useCategories";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { getApiErrorMessage } from "../../lib/errors";
import { CategoryFormModal } from "./CategoryFormModal";
import type { CategoryResponse } from "../../types";

export default function AdminCategoriesPage() {
  const categories = useCategories();
  const deleteCategory = useDeleteCategory();

  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (categories.isLoading) return <LoadingState />;
  if (categories.isError) return <ErrorState message={getApiErrorMessage(categories.error)} />;

  const categoryList = categories.data ?? [];

  const onDelete = async (categoryId: string) => {
    if (!confirm("Delete this category? Products using it may be affected.")) return;
    setError(null);
    try {
      await deleteCategory.mutateAsync(categoryId);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't delete the category."));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Categories</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink hover:bg-accent-deep"
        >
          Add category
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      {categoryList.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No categories yet" description="Vendors need at least one category before they can list products." />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-ink/[0.02] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categoryList.map((category) => (
                <tr key={category.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{category.name}</td>
                  <td className="max-w-md truncate px-4 py-3 text-muted">
                    {category.description || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="text-sm font-medium text-ink underline underline-offset-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(category.id)}
                        className="text-sm font-medium text-danger underline underline-offset-2"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isCreating && <CategoryFormModal category={null} onClose={() => setIsCreating(false)} />}
      {editingCategory && (
        <CategoryFormModal category={editingCategory} onClose={() => setEditingCategory(null)} />
      )}
    </div>
  );
}
