"use client";

import { useEffect, useState } from "react";

export type Book = {
  id: string;
  title: string;
  isbn: string;
  description: string | null;
  publishedYear: number | null;
  genre: string | null;
  pages: number | null;
  authorId: string;
  createdAt: string;
};

export type Author = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  nationality: string | null;
  birthYear: number | null;
  createdAt: string;
  updatedAt: string;
  books: Book[];
};

export type BookResults = {
  data: (Book & { author: Pick<Author, "id" | "name"> })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type AuthorStats = {
  totalBooks: number;
  firstBook: { title: string; year: number } | null;
  latestBook: { title: string; year: number } | null;
  averagePages: number | null;
  genres: string[];
  longestBook: { title: string; pages: number } | null;
  shortestBook: { title: string; pages: number } | null;
};

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new Error(problem?.error || "No se pudo completar la solicitud.");
  }
  return response.json();
}

type Result<T> = { key: string; data?: T; error?: string };

export function useApiData<T>(path: string, revision: number) {
  const key = JSON.stringify([path, revision]);
  const [result, setResult] = useState<Result<T>>();

  useEffect(() => {
    const controller = new AbortController();
    requestJson<T>(path, { signal: controller.signal, cache: "no-store" })
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, data });
      })
      .catch((error: Error) => {
        if (!controller.signal.aborted) setResult({ key, error: error.message });
      });
    return () => controller.abort();
  }, [key, path]);

  const current = result?.key === key ? result : undefined;
  return { data: current?.data, error: current?.error, loading: !current };
}

export function useMutation() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function mutate(path: string, method: "POST" | "PUT" | "DELETE", data?: object) {
    setBusy(true);
    setError("");
    try {
      await requestJson(path, data ? {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      } : { method });
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo guardar el cambio.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, mutate };
}
