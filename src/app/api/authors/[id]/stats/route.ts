import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const author = await prisma.author.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        books: {
          orderBy: { id: "asc" },
          select: { title: true, publishedYear: true, pages: true, genre: true },
        },
      },
    });

    if (!author) {
      return NextResponse.json({ error: "Autor no encontrado" }, { status: 404 });
    }

    type DatedBook = { title: string; year: number };
    type MeasuredBook = { title: string; pages: number };
    let firstBook: DatedBook | null = null;
    let latestBook: DatedBook | null = null;
    let shortestBook: MeasuredBook | null = null;
    let longestBook: MeasuredBook | null = null;
    let totalPages = 0;
    let booksWithPages = 0;
    const genres = new Set<string>();

    for (const { title, publishedYear, pages, genre } of author.books) {
      if (publishedYear !== null) {
        if (!firstBook || publishedYear < firstBook.year) firstBook = { title, year: publishedYear };
        if (!latestBook || publishedYear > latestBook.year) latestBook = { title, year: publishedYear };
      }
      if (pages !== null) {
        totalPages += pages;
        booksWithPages++;
        if (!shortestBook || pages < shortestBook.pages) shortestBook = { title, pages };
        if (!longestBook || pages > longestBook.pages) longestBook = { title, pages };
      }
      if (genre?.trim()) genres.add(genre);
    }

    return NextResponse.json({
      authorId: author.id,
      authorName: author.name,
      totalBooks: author.books.length,
      firstBook,
      latestBook,
      averagePages: booksWithPages ? totalPages / booksWithPages : null,
      genres: [...genres].sort((left, right) => left.localeCompare(right, "es")),
      longestBook,
      shortestBook,
    });
  } catch {
    return NextResponse.json({ error: "No se pudieron consultar las estadísticas" }, { status: 500 });
  }
}
