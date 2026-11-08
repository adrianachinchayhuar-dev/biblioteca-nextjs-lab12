"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Book } from "./data";

export function FormDialog({ title, onClose, children }: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  function close() {
    if (!dialog.current?.querySelector("fieldset:disabled")) onClose();
  }

  return (
    <dialog ref={dialog} className="form-dialog" aria-labelledby={heading} onCancel={(event) => {
      event.preventDefault();
      close();
    }}>
      <div className="section-heading">
        <div><p className="eyebrow">Gestión de la colección</p><h2 id={heading}>{title}</h2></div>
        <button type="button" className="button secondary dialog-close" aria-label="Cerrar formulario" onClick={close}>×</button>
      </div>
      {children}
    </dialog>
  );
}

function BookCover({ book }: { book: Book }) {
  const isbn = book.isbn.replace(/[\s-]/g, "").toUpperCase();
  const valid = /^(?:\d{9}[\dX]|\d{13})$/.test(isbn);
  const [failed, setFailed] = useState(false);
  const palette = Array.from(book.title).reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % 4;

  return (
    <div className={`cover cover-${palette}`} aria-hidden="true">
      <div className="cover-fallback"><span>◆</span><strong>{book.title}</strong><span>✦</span></div>
      {valid && !failed && (
        // Open Library serves covers directly from its cover host.
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer"
          src={`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`} onError={() => setFailed(true)} />
      )}
    </div>
  );
}

export function BookCard({ book, author, actions }: {
  book: Book;
  author?: { id: string; name: string };
  actions?: ReactNode;
}) {
  return (
    <li className="book-card">
      <div className="cover-stage"><BookCover key={book.isbn} book={book} /></div>
      <div className="book-caption">
        {book.genre && <span className="badge">{book.genre}</span>}
        <h3>{book.title}</h3>
        {author && <p><Link href={`/authors/${author.id}`}>{author.name}</Link></p>}
        <p>ISBN {book.isbn}</p>
        {(book.publishedYear !== null || book.pages !== null) && (
          <p>{[book.publishedYear, book.pages === null ? null : `${book.pages} páginas`].filter((value) => value !== null).join(" · ")}</p>
        )}
        {book.description && <p className="multiline">{book.description}</p>}
        {actions && <div className="actions">{actions}</div>}
      </div>
    </li>
  );
}
