"use client";

import type { FormEvent } from "react";
import { type Author, type Book, useMutation } from "./data";

function field(data: FormData, name: string) {
  return String(data.get(name) ?? "").trim();
}

function numberField(data: FormData, name: string) {
  const value = field(data, name);
  return value === "" ? null : Number(value);
}

type FormActions = { onSaved: (message: string) => void; onCancel?: () => void };

export function AuthorForm({ author, onSaved, onCancel }: FormActions & { author?: Author }) {
  const { busy, error, mutate } = useMutation();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const saved = await mutate(author ? `/api/authors/${author.id}` : "/api/authors", author ? "PUT" : "POST", {
      name: field(data, "name"),
      email: field(data, "email"),
      nationality: field(data, "nationality") || null,
      birthYear: numberField(data, "birthYear"),
      bio: field(data, "bio") || null,
    });
    if (saved) {
      if (!author) form.reset();
      onSaved(author ? "Autor actualizado." : "Autor registrado.");
    }
  }

  return (
    <form onSubmit={submit}>
      <fieldset disabled={busy} className="form-grid">
        <label>Nombre completo <input name="name" required defaultValue={author?.name} placeholder="Nombre del autor" /></label>
        <label>Correo electrónico <input name="email" type="email" required defaultValue={author?.email} placeholder="nombre@ejemplo.com" /></label>
        <label>Nacionalidad <input name="nationality" defaultValue={author?.nationality ?? ""} /></label>
        <label>Año de nacimiento <input name="birthYear" type="number" step="1" defaultValue={author?.birthYear ?? ""} /></label>
        <label className="full-field">Biografía <textarea name="bio" rows={3} defaultValue={author?.bio ?? ""} /></label>
        <div className="actions full-field">
          <button className="button primary" type="submit">{busy ? "Guardando…" : author ? "Guardar cambios" : "Registrar autor"}</button>
          {onCancel && <button className="button secondary" type="button" onClick={onCancel}>Cancelar</button>}
        </div>
      </fieldset>
      {error && <p className="notice error" role="alert">{error}</p>}
    </form>
  );
}

type BookFormProps = FormActions & {
  book?: Book;
  authors: Pick<Author, "id" | "name">[];
  fixedAuthorId?: string;
};

export function BookForm({ book, authors, fixedAuthorId, onSaved, onCancel }: BookFormProps) {
  const { busy, error, mutate } = useMutation();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const saved = await mutate(book ? `/api/books/${book.id}` : "/api/books", book ? "PUT" : "POST", {
      title: field(data, "title"),
      isbn: field(data, "isbn"),
      authorId: fixedAuthorId ?? field(data, "authorId"),
      description: field(data, "description") || null,
      publishedYear: numberField(data, "publishedYear"),
      genre: field(data, "genre") || null,
      pages: numberField(data, "pages"),
    });
    if (saved) {
      if (!book) form.reset();
      onSaved(book ? "Libro actualizado." : "Libro registrado.");
    }
  }

  return (
    <form onSubmit={submit}>
      <fieldset disabled={busy} className="form-grid">
        <label>Título <input name="title" required defaultValue={book?.title} /></label>
        <label>ISBN <input name="isbn" required defaultValue={book?.isbn} /></label>
        {!fixedAuthorId && (
          <label className="full-field">Autor
            <select name="authorId" required defaultValue={book?.authorId ?? ""}>
              <option value="" disabled>Selecciona un autor</option>
              {authors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}
            </select>
          </label>
        )}
        <label>Género <input name="genre" defaultValue={book?.genre ?? ""} /></label>
        <label>Año de publicación <input name="publishedYear" type="number" step="1" defaultValue={book?.publishedYear ?? ""} /></label>
        <label>Páginas <input name="pages" type="number" step="1" min="0" defaultValue={book?.pages ?? ""} /></label>
        <label className="full-field">Descripción <textarea name="description" rows={3} defaultValue={book?.description ?? ""} /></label>
        <div className="actions full-field">
          <button className="button primary" type="submit" disabled={!fixedAuthorId && !authors.length}>
            {busy ? "Guardando…" : book ? "Guardar cambios" : "Registrar libro"}
          </button>
          {onCancel && <button className="button secondary" type="button" onClick={onCancel}>Cancelar</button>}
        </div>
      </fieldset>
      {error && <p className="notice error" role="alert">{error}</p>}
    </form>
  );
}
