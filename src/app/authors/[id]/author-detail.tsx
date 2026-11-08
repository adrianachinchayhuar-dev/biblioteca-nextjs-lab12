"use client";

import Link from "next/link";
import { useState } from "react";
import { BookCard, FormDialog } from "../../_library/catalog-ui";
import { type Author, type AuthorStats, useApiData } from "../../_library/data";
import { AuthorForm, BookForm } from "../../_library/forms";
import { LoadStatus, Metric, PageIntro } from "../../_library/ui";

const number = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 2 });
const date = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" });

export function AuthorDetail({ id }: { id: string }) {
  const [revision, setRevision] = useState(0);
  const [editor, setEditor] = useState<"author" | "book">();
  const [success, setSuccess] = useState("");
  const path = `/api/authors/${encodeURIComponent(id)}`;
  const profile = useApiData<Author>(path, revision);
  const statistics = useApiData<AuthorStats>(`${path}/stats`, revision);
  const refresh = () => setRevision((previous) => previous + 1);
  const author = profile.data;
  const stats = statistics.data;
  const close = () => setEditor(undefined);

  function saved(message: string) {
    close();
    setSuccess(message);
    refresh();
  }

  return (
    <main className="shell">
      <PageIntro label="Directorio de autores" title={author?.name ?? "Ficha de autor"}
        description="Consulta su trayectoria editorial y administra los libros asociados a su ficha."
        action={<>
          <Link className="button light" href="/authors">← Ver autores</Link>
          <Link className="button hero-secondary" href="/">Volver al panel</Link>
        </>} />
      {success && <p className="notice success" role="status">{success}</p>}
      <LoadStatus loading={profile.loading} error={profile.error} retry={refresh} label="Cargando datos del autor…" />
      {author && (
        <>
          <section className="panel detail-section" aria-labelledby="stats-title">
            <div className="section-heading"><div><p className="eyebrow">Trayectoria</p><h2 id="stats-title">Estadísticas</h2></div></div>
            <LoadStatus loading={statistics.loading} error={statistics.error} retry={refresh} label="Calculando estadísticas…" />
            {stats && (
              <>
                <dl className="metrics stats">
                  <Metric label="Libros publicados">{stats.totalBooks}</Metric>
                  <Metric label="Promedio de páginas">{stats.averagePages === null ? "—" : number.format(stats.averagePages)}</Metric>
                  <Metric label="Géneros únicos">{stats.genres.length}</Metric>
                  <Metric label="Primer libro" detail={stats.firstBook?.year.toString()}>{stats.firstBook?.title ?? "—"}</Metric>
                  <Metric label="Último libro" detail={stats.latestBook?.year.toString()}>{stats.latestBook?.title ?? "—"}</Metric>
                  <Metric label="Libro más largo" detail={stats.longestBook ? `${stats.longestBook.pages} páginas` : undefined}>{stats.longestBook?.title ?? "—"}</Metric>
                  <Metric label="Libro más corto" detail={stats.shortestBook ? `${stats.shortestBook.pages} páginas` : undefined}>{stats.shortestBook?.title ?? "—"}</Metric>
                </dl>
                {stats.genres.length > 0 && (
                  <ul className="tags" aria-label="Géneros del autor">
                    {stats.genres.map((genre) => <li key={genre} className="badge">{genre}</li>)}
                  </ul>
                )}
              </>
            )}
          </section>

          <div className="stack">
            <section className="panel" aria-labelledby="profile-title">
              <div className="section-heading">
                <div><p className="eyebrow">Perfil</p><h2 id="profile-title">Información del autor</h2></div>
                <button className="button secondary" type="button" onClick={() => setEditor("author")}>Editar perfil</button>
              </div>
              <dl className="profile">
                <div><dt>Nombre</dt><dd>{author.name}</dd></div>
                <div><dt>Correo electrónico</dt><dd>{author.email}</dd></div>
                <div><dt>Nacionalidad</dt><dd>{author.nationality ?? "Sin registrar"}</dd></div>
                <div><dt>Año de nacimiento</dt><dd>{author.birthYear ?? "Sin registrar"}</dd></div>
                <div><dt>Registro</dt><dd>{date.format(new Date(author.createdAt))}</dd></div>
                <div><dt>Última actualización</dt><dd>{date.format(new Date(author.updatedAt))}</dd></div>
                <div className="full-field"><dt>Biografía</dt><dd className="multiline">{author.bio ?? "Sin biografía registrada."}</dd></div>
              </dl>
            </section>

            <section className="panel" aria-labelledby="author-books-title">
              <div className="section-heading">
                <div><p className="eyebrow">Obras</p><h2 id="author-books-title">Libros del autor</h2></div>
                <button className="button primary" type="button" onClick={() => setEditor("book")}>＋ Agregar libro</button>
              </div>
              {author.books.length === 0 ? <p className="empty">Este autor todavía no tiene libros registrados.</p> : (
                <ul className="book-grid">
                  {author.books.map((book) => <BookCard key={book.id} book={book} />)}
                </ul>
              )}
            </section>
          </div>
          {editor && <FormDialog title={editor === "author" ? "Editar autor" : "Agregar libro"} onClose={close}>
            {editor === "author"
              ? <AuthorForm author={author} onSaved={saved} onCancel={close} />
              : <BookForm authors={[author]} fixedAuthorId={id} onSaved={saved} onCancel={close} />}
          </FormDialog>}
        </>
      )}
    </main>
  );
}
