"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookCard, FormDialog } from "../_library/catalog-ui";
import { type Author, type Book, type BookResults, useApiData, useMutation } from "../_library/data";
import { BookForm } from "../_library/forms";
import { LoadStatus, PageIntro } from "../_library/ui";

export default function BooksPage() {
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [search, setSearch] = useState({ title: "", authorName: "" });
  const [genre, setGenre] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [revision, setRevision] = useState(0);
  const [editor, setEditor] = useState<Book | "new">();
  const [success, setSuccess] = useState("");
  const deletion = useMutation();

  const waitingForInput = title.trim() !== search.title || authorName.trim() !== search.authorName;
  useEffect(() => {
    if (!waitingForInput) return;
    const timer = window.setTimeout(() => {
      setSearch({ title: title.trim(), authorName: authorName.trim() });
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [title, authorName, waitingForInput]);

  const query = new URLSearchParams({ page: String(page), limit, sortBy, order });
  if (search.title) query.set("search", search.title);
  if (search.authorName) query.set("authorName", search.authorName);
  if (genre) query.set("genre", genre);
  if (authorId) query.set("authorId", authorId);
  const results = useApiData<BookResults>(`/api/books/search?${query}`, revision);
  const directory = useApiData<Author[]>("/api/authors", revision);
  const authors = directory.data ?? [];
  const genres = new Set<string>(genre ? [genre] : []);
  for (const author of authors) {
    for (const book of author.books) {
      if (book.genre?.trim()) genres.add(book.genre);
    }
  }
  const refresh = () => setRevision((previous) => previous + 1);
  const close = () => setEditor(undefined);
  const current = waitingForInput ? undefined : results.data;

  function saved(message: string) {
    if (editor === "new") setPage(1);
    close();
    setSuccess(message);
    refresh();
  }

  async function remove(book: Book) {
    if (!window.confirm(`¿Eliminar «${book.title}» del catálogo?`)) return;
    setSuccess("");
    if (await deletion.mutate(`/api/books/${book.id}`, "DELETE")) {
      setSuccess("Libro eliminado.");
      if (current?.data.length === 1 && page > 1) setPage(page - 1);
      refresh();
    }
  }

  return (
    <main className="shell">
      <PageIntro label="01 / Colección" title="Catálogo de libros"
        description="Recorre tu estantería y encuentra un libro por su título, autor o género."
        action={<button className="button light" type="button" disabled={!authors.length} onClick={() => setEditor("new")}>＋ Nuevo libro</button>} />

      {success && <p className="notice success" role="status">{success}</p>}
      <section className="panel" aria-labelledby="catalog-title">
        <div className="section-heading">
          <div><p className="eyebrow">Explorar</p><h2 id="catalog-title">Buscar libros</h2></div>
          {current && <span className="badge" role="status">{current.pagination.total} {current.pagination.total === 1 ? "resultado" : "resultados"}</span>}
        </div>

        <div className="form-grid filters catalog-filters">
          <label>Título
            <input type="search" placeholder="Buscar por título…" value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>Nombre de autor
            <input type="search" placeholder="Buscar por nombre…" value={authorName} onChange={(event) => setAuthorName(event.target.value)} />
          </label>
          <label>Género
            <select value={genre} onChange={(event) => { setGenre(event.target.value); setPage(1); }}>
              <option value="">Todos los géneros</option>
              {[...genres].sort((left, right) => left.localeCompare(right, "es")).map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>Autor
            <select value={authorId} onChange={(event) => { setAuthorId(event.target.value); setPage(1); }}>
              <option value="">Todos los autores</option>
              {authorId && !authors.some((author) => author.id === authorId) && <option value={authorId}>Autor seleccionado</option>}
              {authors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}
            </select>
          </label>
          <label>Ordenar por
            <select value={sortBy} onChange={(event) => { setSortBy(event.target.value); setPage(1); }}>
              <option value="createdAt">Fecha de creación</option>
              <option value="title">Título</option>
              <option value="publishedYear">Año de publicación</option>
            </select>
          </label>
          <label>Dirección
            <select value={order} onChange={(event) => { setOrder(event.target.value); setPage(1); }}>
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </label>
          <label>Resultados por página
            <select value={limit} onChange={(event) => { setLimit(event.target.value); setPage(1); }}>
              <option value="10">10 resultados</option>
              <option value="20">20 resultados</option>
              <option value="50">50 resultados</option>
            </select>
          </label>
        </div>

        <LoadStatus loading={directory.loading} error={directory.error} retry={refresh} label="Cargando autores y géneros…" />
        {directory.data?.length === 0 && <p className="notice">Primero <Link href="/authors">registra un autor</Link> para añadir libros.</p>}
        <LoadStatus loading={waitingForInput || results.loading} error={results.error} retry={refresh} label="Buscando libros…" />
        {deletion.error && <p className="notice error" role="alert">{deletion.error}</p>}
        {current && (
          <>
            {current.data.length === 0 ? (
              <p className="empty">{current.pagination.total
                ? "Esta página ya no tiene libros. Regresa a la última página disponible."
                : "No se encontraron libros con estos filtros."}</p>
            ) : (
              <ul className="book-grid">
                {current.data.map((book) => (
                  <BookCard key={book.id} book={book} author={book.author} actions={<>
                    <button type="button" className="button secondary" aria-label={`Editar ${book.title}`}
                      disabled={!authors.length} onClick={() => setEditor(book)}>Editar</button>
                    <button type="button" className="button danger" aria-label={`Eliminar ${book.title}`} disabled={deletion.busy}
                      onClick={() => void remove(book)}>Eliminar</button>
                  </>} />
                ))}
              </ul>
            )}

            {(current.pagination.totalPages > 1 || current.pagination.hasPrev) && (
              <nav className="pagination" aria-label="Paginación de libros">
                <button className="button secondary" disabled={!current.pagination.hasPrev} onClick={() => {
                  setPage(Math.max(1, Math.min(page - 1, current.pagination.totalPages)));
                }}>← Anterior</button>
                <span>{page <= current.pagination.totalPages
                  ? `Página ${page} de ${current.pagination.totalPages}`
                  : "Página sin resultados"}</span>
                <button className="button secondary" disabled={!current.pagination.hasNext} onClick={() => setPage(page + 1)}>Siguiente →</button>
              </nav>
            )}
          </>
        )}
      </section>
      {editor && <FormDialog title={editor === "new" ? "Nuevo libro" : "Editar libro"} onClose={close}>
        <BookForm book={editor === "new" ? undefined : editor} authors={authors} onSaved={saved} onCancel={close} />
      </FormDialog>}
    </main>
  );
}
