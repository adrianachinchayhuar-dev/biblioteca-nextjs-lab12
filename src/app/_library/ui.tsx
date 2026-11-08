import type { ReactNode } from "react";

export function PageIntro({ label, title, description, action }: {
  label: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-intro">
      <div className="intro-content">
        <p className="eyebrow">{label}</p>
        <h1>{title}</h1>
        <p className="intro-description">{description}</p>
        {action && <div className="intro-action">{action}</div>}
      </div>
      <div className="book-art" aria-hidden="true" />
    </header>
  );
}

export function Metric({ label, children, detail }: { label: string; children: ReactNode; detail?: string }) {
  return (
    <div className="metric">
      <dt>{label}</dt>
      <dd>{children}</dd>
      {detail && <dd className="metric-detail">{detail}</dd>}
    </div>
  );
}

export function LoadStatus({ loading, error, retry, label }: {
  loading: boolean;
  error?: string;
  retry: () => void;
  label: string;
}) {
  if (loading) return <p className="notice" role="status"><span className="spinner" />{label}</p>;
  if (!error) return null;
  return (
    <div className="notice error">
      <span role="alert">{error}</span>
      <button type="button" className="button secondary" onClick={retry}>Reintentar</button>
    </div>
  );
}
