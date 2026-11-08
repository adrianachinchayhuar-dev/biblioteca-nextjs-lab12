"use client";

import Link from "next/link";
import { useState } from "react";
import { FormDialog } from "../_library/catalog-ui";
import { type Author, useApiData, useMutation } from "../_library/data";
import { AuthorForm } from "../_library/forms";
import { LoadStatus, PageIntro } from "../_library/ui";

export default function AuthorsPage() {
  const [revision, setRevision] = useState(0);
  const [editor, setEditor] = useState<Author | "new">();
  const [success, setSuccess] = useState("");
  const { data: authors, error, loading } = useApiData<Author[]>("/api/authors", revision);
  const deletion = useMutation();
  const refresh = () => setRevision((previous) => previous + 1);
  const close = () => setEditor(undefined);

  function saved(message: string) {
    close();
    setSuccess(message);
    refresh();
  }

  async function remove(author: Author) {
    if (!window.confirm(`¿Eliminar a «${author.name}»? También se eliminarán sus libros.`)) return;
    setSuccess("");
    if (await deletion.mutate(`/api/authors/${author.id}`, "DELETE")) saved("Autor eliminado.");
  }

  return (
    <main className="shell">
      <PageIntro label="02 / Directorio" title="Autores"
        description="Consulta las fichas de quienes escribieron los libros de tu colección."
        action={<button className="button light" type="button" onClick={() => setEditor("new")}>＋ Nuevo autor</button>} />
      {success && <p className="notice success" role="status">{success}</p>}
      <section className="panel" aria-labelledby="authors-title">
        <div className="section-heading">
          <div><p className="eyebrow">La colección</p><h2 id="authors-title">Autores registrados</h2></div>
          {authors && <span className="badge">{authors.length} {authors.length === 1 ? "autor" : "autores"}</span>}
        </div>
        <LoadStatus loading={loading} error={error} retry={refresh} label="Cargando autores…" />
        {deletion.error && <p className="notice error" role="alert">{deletion.error}</p>}
        {authors?.length === 0 && <p className="empty">Todavía no hay autores. Registra el primero para empezar tu colección.</p>}
        {!!authors?.length && (
          <ul className="author-grid">
            {authors.map((author) => (
              <li key={author.id} className="author-card">
                <span className="avatar" aria-hidden="true">{author.name.trim().slice(0, 1).toUpperCase()}</span>
                <div className="record-content">
                  <h3>{author.name}</h3>
                  <p>{author.email}</p>
                  <p>{author.nationality && `${author.nationality} · `}{author.books.length} {author.books.length === 1 ? "libro" : "libros"}</p>
                  <div className="actions">
                    <Link className="button secondary" href={`/authors/${author.id}`}>Ver libros</Link>
                    <button className="button secondary" type="button" aria-label={`Editar a ${author.name}`} onClick={() => setEditor(author)}>Editar</button>
                    <button className="button danger" type="button" aria-label={`Eliminar a ${author.name}`} disabled={deletion.busy}
                      onClick={() => void remove(author)}>Eliminar</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      {editor && <FormDialog title={editor === "new" ? "Nuevo autor" : "Editar autor"} onClose={close}>
        <AuthorForm author={editor === "new" ? undefined : editor} onSaved={saved} onCancel={close} />
      </FormDialog>}
    </main>
  );
}
