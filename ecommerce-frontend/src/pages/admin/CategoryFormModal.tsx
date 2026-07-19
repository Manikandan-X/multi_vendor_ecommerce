import { useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { useCreateCategory, useUpdateCategory } from "../../hooks/useCategories";
import { getApiErrorMessage } from "../../lib/errors";
import type { CategoryResponse } from "../../types";

export function CategoryFormModal({
  category,
  onClose,
}: {
  category: CategoryResponse | null; // null = create mode
  onClose: () => void;
}) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [error, setError] = useState<string | null>(null);

  const isSaving = createCategory.isPending || updateCategory.isPending;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (category) {
        await updateCategory.mutateAsync({
          categoryId: category.id,
          data: { name, description: description || null },
        });
      } else {
        await createCategory.mutateAsync({ name, description: description || null });
      }
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't save the category."));
    }
  };

  return (
    <Modal title={category ? "Edit category" : "Add category"} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            maxLength={100}
            required
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Description <span className="text-muted">(optional)</span>
          </label>
          <textarea
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-semibold text-ink hover:bg-ink/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-lg bg-ink py-2.5 text-sm font-semibold text-white hover:bg-ink-light disabled:opacity-60"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
