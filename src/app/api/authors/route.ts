
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// GET /api/authors
export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      include: {
        books: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(authors);
  } catch (error) {
    console.error("Error al obtener autores:", error);

    return NextResponse.json(
      { error: "Error al obtener autores" },
      { status: 500 }
    );
  }
}

// POST /api/authors
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, bio, nationality, birthYear } = body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return NextResponse.json(
        { error: "El nombre y el correo son obligatorios" },
        { status: 400 }
      );
    }

    const author = await prisma.author.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        bio: bio ?? null,
        nationality: nationality ?? null,
        birthYear: birthYear == null ? null : Number(birthYear),
      },
    });

    return NextResponse.json(author, { status: 201 });
  } catch (error) {
    console.error("Error al crear autor:", error);

    return NextResponse.json(
      { error: "No se pudo crear el autor. Revisa los datos y el correo único." },
      { status: 500 }
    );
  }
}
