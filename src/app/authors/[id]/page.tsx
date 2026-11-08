import { Suspense } from "react";
import { AuthorDetail } from "./author-detail";

type Props = { params: Promise<{ id: string }> };

async function AuthorContent({ params }: Props) {
  const { id } = await params;
  return <AuthorDetail id={id} />;
}

export default function AuthorPage({ params }: Props) {
  return (
    <Suspense fallback={<main className="shell"><p className="notice" role="status">Cargando ficha del autor…</p></main>}>
      <AuthorContent params={params} />
    </Suspense>
  );
}
