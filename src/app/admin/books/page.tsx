"use client";

import { useState, useEffect, useCallback } from "react";
import { BookCover } from "@/components/book/BookCover";
import { BookFormModal } from "@/components/admin/BookFormModal";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatINR } from "@/lib/currency";
import Link from "next/link";
import { PlusCircle, BookOpen } from "lucide-react";
import type { Book, Category } from "@/types";

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBook, setEditBook] = useState<Book | undefined>();

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

  const published = books.filter((b) => b.published).length;

  return (
    <AdminShell
      title="Books"
      subtitle={`${books.length} total · ${published} published`}
      action={
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#FFC928] text-[#080808] text-[13px] font-body font-semibold px-5 py-2.5 rounded-lg hover:bg-[#F2B916] transition-colors shadow-sm"
        >
          <PlusCircle size={14} />
          Add Book
        </button>
      }
    >
      <div className="bg-white border border-[#E6E3DD] rounded-xl overflow-hidden shadow-sm">
        {books.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-xl bg-[#F2F0EC] flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-[#ccc]" />
            </div>
            <p className="text-[15px] font-body text-[#bbb] mb-2">No books yet.</p>
            <button onClick={openAdd} className="text-[14px] text-[#789185] hover:underline font-semibold">
              Add your first book →
            </button>
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
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => openEdit(book)}
                          className="text-[13px] text-[#789185] hover:text-[#080808] font-semibold hover:underline transition-colors"
                        >
                          Edit
                        </button>
                        <Link href={`/books/${book.slug}`} target="_blank" className="text-[13px] text-[#bbb] hover:text-[#888] hover:underline transition-colors">
                          View ↗
                        </Link>
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
    </AdminShell>
  );
}
