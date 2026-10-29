"use client";

import { useState, useEffect, useCallback } from "react";
import { BookCover } from "@/components/book/BookCover";
import { BookFormModal } from "@/components/admin/BookFormModal";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminModal } from "@/components/admin/AdminModal";
import { formatINR } from "@/lib/currency";
import Link from "next/link";
import { PlusCircle, BookOpen, Pencil, ExternalLink, Trash2 } from "lucide-react";
import type { Book, Category } from "@/types";

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBook, setEditBook] = useState<Book | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    const [bRes, cRes] = await Promise.all([
      fetch("/api/admin/books"),
      fetch("/api/admin/categories"),
    ]);
    const bJson = await bRes.json();
    const cJson = await cRes.json();
    if (bJson.success) setBooks(bJson.data);
    if (cJson.success) setCategories(cJson.data);
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const openAdd = () => { setEditBook(undefined); setModalOpen(true); };
  const openEdit = (book: Book) => { setEditBook(book); setModalOpen(true); };
  const handleClose = () => { setModalOpen(false); fetchBooks(); };

  const openDelete = (book: Book) => { setDeleteTarget(book); setDeleteError(null); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/books/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete book");
      setDeleteTarget(null);
      fetchBooks();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  const published = books.filter((b) => b.published).length;

  return (
    <AdminShell
      title="Books"
      subtitle={`${books.length} total · ${published} published`}
      action={
        <AdminButton onClick={openAdd} icon={<PlusCircle />}>
          Add Book
        </AdminButton>
      }
    >
      <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
        {books.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-xl bg-[#F2F0EC] flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-[#ccc]" />
            </div>
            <p className="text-[15px] font-body text-[#bbb] mb-3">No books yet.</p>
            <AdminButton variant="inline" onClick={openAdd}>
              Add your first book →
            </AdminButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-body min-w-[640px]">
              <thead>
                <tr className="border-b border-[#EDE9E3] bg-[#FAF9F6]">
                  <th className="text-left px-5 py-4 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Cover</th>
                  <th className="text-left px-4 py-4 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Title</th>
                  <th className="text-left px-4 py-4 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Price</th>
                  <th className="text-left px-4 py-4 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Status</th>
                  <th className="text-left px-4 py-4 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Featured</th>
                  <th className="text-left px-4 py-4 text-[11px] uppercase tracking-[0.07em] text-[#b0aca6] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F0EC]">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="px-5 py-4">
                      <BookCover src={book.coverImageUrl} title={book.title} size="sm" />
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[#080808] text-[14px]">{book.title}</p>
                      {book.subtitle && <p className="text-[12.5px] text-[#aaa] mt-0.5">{book.subtitle}</p>}
                    </td>
                    <td className="px-4 py-4 font-semibold text-[#080808] text-[14px]">{formatINR(book.pricePaise)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-3 py-1 text-[11px] rounded-full font-semibold ring-1 ${
                        book.published
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-slate-50 text-slate-500 ring-slate-200"
                      }`}>
                        {book.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {book.featured ? (
                        <span className="inline-flex items-center px-3 py-1 text-[11px] rounded-full font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                          Featured
                        </span>
                      ) : (
                        <span className="text-[#ddd]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <AdminButton
                          variant="inline"
                          onClick={() => openEdit(book)}
                          icon={<Pencil />}
                        >
                          Edit
                        </AdminButton>
                        <Link
                          href={`/books/${book.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 bg-transparent text-[#888] hover:text-[#080808] transition-colors rounded-md text-xs px-2 py-1.5 font-semibold font-body"
                        >
                          <ExternalLink size={12} />
                          View
                        </Link>
                        <button
                          onClick={() => openDelete(book)}
                          title="Delete book"
                          className="w-7 h-7 flex items-center justify-center rounded-md text-[#aaa] hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BookFormModal open={modalOpen} onClose={handleClose} book={editBook} categories={categories} />

      {/* Delete confirmation modal */}
      <AdminModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Book">
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm font-body text-[#555]">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-[#080808]">{deleteTarget?.title}</span>?
            This will also remove its cover image and PDF files from storage, and revoke all download entitlements. This action cannot be undone.
          </p>
          {deleteError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-body">
              {deleteError}
            </p>
          )}
          <div className="flex gap-3">
            <AdminButton variant="secondary" className="flex-1" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AdminButton>
            <AdminButton
              variant="danger"
              className="flex-1"
              loading={deleting}
              loadingText="Deleting…"
              onClick={handleDelete}
            >
              Delete Book
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </AdminShell>
  );
}
