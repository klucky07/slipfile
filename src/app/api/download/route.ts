import { NextResponse } from "next/server";
import { supabase } from "@/lib/SupabaseClient";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filePath } = await req.json();

  const { data, error } = await supabase.storage
    .from("user-files")
    .createSignedUrl(filePath, 60); // URL valid for 60s

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ url: data.signedUrl });
}
