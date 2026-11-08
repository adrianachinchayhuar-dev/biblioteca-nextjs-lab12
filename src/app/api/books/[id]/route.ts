import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


type Context = {
  params: Promise<{ id: string }>;
};

// GET /api/books/[id]
export async function GET(
  request: Request,
  { params }: Context
) {
  try {
    const { id } = await params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Libro no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error al consultar libro" },
      { status: 500 }
    );
  }
}

// PUT /api/books/[id]
export async function PUT(
  request: Request,
  { params }: Context
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.book.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Libro no encontrado" },
        { status: 404 }
      );
    }

    const data: {
      title?: string;
      description?: string | null;
      isbn?: string;
      publishedYear?: number | null;
      genre?: string | null;
      pages?: number | null;
      authorId?: string;
    } = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json(
          { error: "Título inválido" },
          { status: 400 }
        );
      }
      data.title = body.title.trim();
    }

    if (body.isbn !== undefined) {
      if (typeof body.isbn !== "string" || !body.isbn.trim()) {
        return NextResponse.json(
          { error: "ISBN inválido" },
          { status: 400 }
        );
      }
      data.isbn = body.isbn.trim();
    }

    if (body.description !== undefined) {
      data.description = body.description;
    }

    if (body.genre !== undefined) {
      data.genre = body.genre;
    }

    if (body.publishedYear !== undefined) {
      data.publishedYear =
        body.publishedYear === null
          ? null
          : Number(body.publishedYear);
    }

    if (body.pages !== undefined) {
      data.pages =
        body.pages === null ? null : Number(body.pages);
    }

    if (body.authorId !== undefined) {
      if (typeof body.authorId !== "string") {
        return NextResponse.json(
          { error: "Autor inválido" },
          { status: 400 }
        );
      }

      const author = await prisma.author.findUnique({
        where: { id: body.authorId },
      });

      if (!author) {
        return NextResponse.json(
          { error: "El autor no existe" },
          { status: 404 }
        );
      }

      data.authorId = body.authorId;
    }

    const book = await prisma.book.update({
      where: { id },
      data,
      include: { author: true },
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error al actualizar libro" },
      { status: 500 }
    );
  }
}

// DELETE /api/books/[id]
export async function DELETE(
  request: Request,
  { params }: Context
) {
  try {
    const { id } = await params;

    const existing = await prisma.book.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Libro no encontrado" },
        { status: 404 }
      );
    }

    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Libro eliminado correctamente",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error al eliminar libro" },
      { status: 500 }
    );
  }
}
