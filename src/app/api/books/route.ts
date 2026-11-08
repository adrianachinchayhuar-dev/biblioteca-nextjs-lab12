
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// GET /api/books
export async function GET() {
  try {
    const books = await prisma.book.findMany({
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error("Error al obtener libros:", error);

    return NextResponse.json(
      { error: "Error al obtener libros" },
      { status: 500 }
    );
  }
}

// POST /api/books
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      isbn,
      publishedYear,
      genre,
      pages,
      authorId,
    } = body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof isbn !== "string" ||
      !isbn.trim() ||
      typeof authorId !== "string" ||
      !authorId.trim()
    ) {
      return NextResponse.json(
        { error: "Título, ISBN y autor son obligatorios" },
        { status: 400 }
      );
    }

    const author = await prisma.author.findUnique({
      where: { id: authorId },
    });

    if (!author) {
      return NextResponse.json(
        { error: "El autor indicado no existe" },
        { status: 404 }
      );
    }

    const book = await prisma.book.create({
      data: {
        title: title.trim(),
        description: description ?? null,
        isbn: isbn.trim(),
        publishedYear:
          publishedYear == null ? null : Number(publishedYear),
        genre: genre ?? null,
        pages: pages == null ? null : Number(pages),
        authorId,
      },
      include: {
        author: true,
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error("Error al crear libro:", error);

    return NextResponse.json(
      { error: "No se pudo crear el libro. Revisa los datos y el ISBN único." },
      { status: 500 }
    );
  }
}
