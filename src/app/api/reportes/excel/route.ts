import { NextRequest, NextResponse } from "next/server";
import {
  basicAuth,
  getBackendExcelReportUrl,
  NGROK_SKIP_BROWSER_WARNING_HEADER,
} from "@/lib/backend";

export async function GET(request: NextRequest) {
  const consultoraId = request.nextUrl.searchParams.get("consultoraId");
  const periodo = request.nextUrl.searchParams.get("periodo");

  if (!consultoraId || !periodo) {
    return NextResponse.json(
      {
        error: "Bad Request",
        message: "consultoraId y periodo son obligatorios.",
      },
      { status: 400 },
    );
  }

  const upstream = await fetch(
    getBackendExcelReportUrl(Number(consultoraId), periodo),
    {
      method: "GET",
      headers: {
        Authorization: basicAuth,
        ...NGROK_SKIP_BROWSER_WARNING_HEADER,
      },
    },
  );

  const headers = new Headers(upstream.headers);
  headers.delete("content-encoding");
  headers.delete("transfer-encoding");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}
