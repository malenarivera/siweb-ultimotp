import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth0.getSession();
    const accessToken = session?.tokenSet?.accessToken;
    
    if (!accessToken) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    return NextResponse.json({ token: accessToken });
  } catch (error) {
    console.error("Error al obtener token:", error);
    return NextResponse.json({ error: "Error al obtener token" }, { status: 500 });
  }
}

