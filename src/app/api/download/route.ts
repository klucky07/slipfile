import { NextResponse } from "next/server";
import { supabase } from "@/lib/SupabaseClient";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filePath } = await req.json();

  try {
   
    const { data, error } = await supabase.storage
      .from("user-files")
      .createSignedUrl(filePath, 1800); // URL valid for 30 minutes

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ url: data.signedUrl });
  } catch (err) {
    console.error("Download error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}