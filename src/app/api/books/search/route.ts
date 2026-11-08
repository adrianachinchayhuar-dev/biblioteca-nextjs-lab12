import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function positiveInteger(value: string | null, fallback: number) {
  if (value === null) return fallback;
  return /^\d+$/.test(value) ? Number(value) : NaN;
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const page = positiveInteger(query.get("page"), 1);
  const limit = positiveInteger(query.get("limit"), 10);
  const skip = (page - 1) * limit;
  const sortBy = query.get("sortBy") ?? "createdAt";
  const order = query.get("order") ?? "desc";

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    return NextResponse.json({ error: "limit debe ser un entero entre 1 y 50" }, { status: 400 });
  }
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(skip)) {
    return NextResponse.json({ error: "page debe ser un entero positivo válido" }, { status: 400 });
  }
  if (sortBy !== "title" && sortBy !== "publishedYear" && sortBy !== "createdAt") {
    return NextResponse.json({ error: "sortBy debe ser title, publishedYear o createdAt" }, { status: 400 });
  }
  if (order !== "asc" && order !== "desc") {
    return NextResponse.json({ error: "order debe ser asc o desc" }, { status: 400 });
  }

  const search = query.get("search")?.trim();
  const genre = query.get("genre");
  const authorName = query.get("authorName")?.trim();
  const authorId = query.get("authorId")?.trim();
  const where: Prisma.BookWhereInput = {};
  if (search) where.title = { contains: escapeLike(search), mode: "insensitive" };
  if (genre) where.genre = genre;
  if (authorName) where.author = { name: { contains: escapeLike(authorName), mode: "insensitive" } };
  if (authorId) where.authorId = authorId;

  try {
    const [data, total] = await prisma.$transaction([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ [sortBy]: order }, { id: "asc" }],
        include: { author: { select: { id: true, name: true } } },
      }),
      prisma.book.count({ where }),
    ], { isolationLevel: "RepeatableRead" });
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    });
  } catch {
    return NextResponse.json({ error: "No se pudo consultar el catálogo" }, { status: 500 });
  }
}
