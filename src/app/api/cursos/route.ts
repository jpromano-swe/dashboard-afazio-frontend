import { NextRequest, NextResponse } from "next/server";
import { crearCurso, getCursos } from "@/lib/backend";

export async function GET(request: NextRequest) {
  const consultoraIdParam = request.nextUrl.searchParams.get("consultoraId");
  const consultoraId = consultoraIdParam ? Number(consultoraIdParam) : undefined;

  const cursos = await getCursos(
    typeof consultoraId === "number" && Number.isFinite(consultoraId)
      ? consultoraId
      : undefined,
  );

  return NextResponse.json(cursos);
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as {
    consultoraId: number;
    empresa: string;
    grupo: string | null;
    activa: boolean;
  };

  const curso = await crearCurso(payload);

  return NextResponse.json(curso, { status: 201 });
}
