"use client";

import Link from "next/link";
import { useState } from "react";
import { BookCard, FormDialog } from "./_library/catalog-ui";
import { type Author, useApiData } from "./_library/data";
import { AuthorForm } from "./_library/forms";
import { LoadStatus, Metric, PageIntro } from "./_library/ui";

export default function Home() {
  const [revision, setRevision] = useState(0);
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState("");
  const { data: authors, error, loading } = useApiData<Author[]>("/api/authors", revision);
  const refresh = () => setRevision((previous) => previous + 1);
  const books = authors?.flatMap((author) => author.books.map((book) => ({ book, author }))) ?? [];
  const recent = books.toSorted((left, right) => right.book.createdAt.localeCompare(left.book.createdAt)).slice(0, 3);
  const counts = new Map<string, number>();
  for (const { book } of books) {
    if (book.genre?.trim()) counts.set(book.genre, (counts.get(book.genre) ?? 0) + 1);
  }
  const genres = [...counts].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "es")).slice(0, 5);

  return (
    <main className="shell">
      <PageIntro label="Tu espacio literario" title="Entre Páginas"
        description="Un lugar para reunir tus libros, conocer a sus autores y recorrer tu colección."
        action={<>
          <Link className="button light" href="/books">Explorar catálogo <span aria-hidden="true">↗</span></Link>
          <button className="button hero-secondary" type="button" onClick={() => setAdding(true)}>＋ Nuevo autor</button>
        </>} />
      <dl className="metrics">
        <Metric label="Autores registrados" detail="En el directorio">{authors?.length ?? "—"}</Metric>
        <Metric label="Libros en catálogo" detail="En la colección">{authors ? books.length : "—"}</Metric>
        <Metric label="Géneros disponibles" detail="En los libros registrados">{authors ? counts.size : "—"}</Metric>
      </dl>
      <LoadStatus loading={loading} error={error} retry={refresh} label="Cargando el resumen de la biblioteca…" />
      {success && <p className="notice success" role="status">{success}</p>}
      <div className="dashboard-grid">
        <section className="panel" aria-labelledby="recent-books">
          <div className="section-heading">
            <div><p className="eyebrow">En el estante</p><h2 id="recent-books">Últimas incorporaciones</h2></div>
            <Link className="text-link" href="/books">Ver catálogo ↗</Link>
          </div>
          {authors && (recent.length ? <ul className="book-grid recent-books">
            {recent.map(({ book, author }) => <BookCard key={book.id} book={book} author={author} />)}
          </ul> : <p className="empty">Los libros que registres aparecerán aquí.</p>)}
        </section>
        <section className="panel genre-panel" aria-labelledby="genres">
          <div className="section-heading"><div><p className="eyebrow">Estadísticas generales</p><h2 id="genres">Libros por género</h2></div></div>
          {authors && (genres.length ? <ul className="genre-chart">
            {genres.map(([genre, count]) => <li key={genre}>
              <div><span>{genre}</span><strong>{count}</strong></div>
              <progress aria-label={genre} value={count} max={books.length}>{count}</progress>
            </li>)}
          </ul> : <p className="empty">La distribución aparecerá cuando registres libros con género.</p>)}
        </section>
        <section className="panel" aria-labelledby="recent-authors">
          <div className="section-heading">
            <div><p className="eyebrow">Directorio</p><h2 id="recent-authors">Autores recientes</h2></div>
            <Link className="text-link" href="/authors">Ver directorio ↗</Link>
          </div>
          {authors && (authors.length ? <ul className="records">
            {authors.slice(0, 4).map((author) => <li key={author.id} className="record">
              <span className="avatar" aria-hidden="true">{author.name.trim().slice(0, 1).toUpperCase()}</span>
              <div className="record-content"><h3><Link href={`/authors/${author.id}`}>{author.name}</Link></h3>
                <p>{author.books.length} {author.books.length === 1 ? "libro" : "libros"}</p></div>
            </li>)}
          </ul> : <p className="empty">El directorio está listo para recibir a tu primer autor.</p>)}
        </section>
        <section className="panel quick-links" aria-labelledby="quick-links">
          <div className="section-heading"><div><p className="eyebrow">Atajos</p><h2 id="quick-links">Accesos rápidos</h2></div></div>
          <Link className="button primary" href="/books">Explorar libros</Link>
          <Link className="button secondary" href="/authors">Gestionar autores</Link>
        </section>
      </div>
      {adding && <FormDialog title="Nuevo autor" onClose={() => setAdding(false)}>
        <AuthorForm onCancel={() => setAdding(false)} onSaved={(message) => {
          setAdding(false);
          setSuccess(message);
          refresh();
        }} />
      </FormDialog>}
    </main>
  );
}
