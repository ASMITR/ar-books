"use client";

import { AdminModal } from "./AdminModal";
import { BookForm } from "./BookForm";
import type { Book, Category, Series } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  book?: Book;
  categories: Category[];
  series: Series[];
}

export function BookFormModal({ open, onClose, book, categories, series }: Props) {
  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={book ? `Edit: ${book.title}` : "Add New Book"}
      maxWidth="max-w-2xl"
    >
      <div className="p-6">
        <BookForm book={book} categories={categories} series={series} onSuccess={onClose} />
      </div>
    </AdminModal>
  );
}
