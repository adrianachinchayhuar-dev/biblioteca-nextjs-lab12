
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


type Context = {
  params: Promise<{ id: string }>;
};

// GET /api/authors/[id]
export async function GET(
  request: Request,
  { params }: Context
) {
  try {
    const { id } = await params;

    const author = await prisma.author.findUnique({
      where: { id },
      include: { books: true },
    });

    if (!author) {
      return NextResponse.json(
        { error: "Autor no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(author);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error al consultar autor" },
      { status: 500 }
    );
  }
}

// PUT /api/authors/[id]
export async function PUT(
  request: Request,
  { params }: Context
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.author.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Autor no encontrado" },
        { status: 404 }
      );
    }

    const data: {
      name?: string;
      email?: string;
      bio?: string | null;
      nationality?: string | null;
      birthYear?: number | null;
    } = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json(
          { error: "Nombre inválido" },
          { status: 400 }
        );
      }
      data.name = body.name.trim();
    }

    if (body.email !== undefined) {
      if (typeof body.email !== "string" || !body.email.trim()) {
        return NextResponse.json(
          { error: "Correo inválido" },
          { status: 400 }
        );
      }
      data.email = body.email.trim();
    }

    if (body.bio !== undefined) data.bio = body.bio;
    if (body.nationality !== undefined) {
      data.nationality = body.nationality;
    }
    if (body.birthYear !== undefined) {
      data.birthYear =
        body.birthYear === null ? null : Number(body.birthYear);
    }

    const author = await prisma.author.update({
      where: { id },
      data,
    });

    return NextResponse.json(author);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error al actualizar autor" },
      { status: 500 }
    );
  }
}

// DELETE /api/authors/[id]
export async function DELETE(
  request: Request,
  { params }: Context
) {
  try {
    const { id } = await params;

    const existing = await prisma.author.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Autor no encontrado" },
        { status: 404 }
      );
    }

    await prisma.author.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Autor eliminado correctamente",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error al eliminar autor" },
      { status: 500 }
    );
  }
}
