import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/SupabaseClient";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `${session.user.id}/transfer-${timestamp}-${sanitizedFileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabaseAdmin.storage
      .from("user-files")
      .upload(filePath, buffer, {
        upsert: true,
        contentType: file.type || "application/octet-stream",
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });


   const channel = supabaseAdmin.channel("file-transfers");
await channel.send({
  type: "broadcast",
  event: "file_uploaded", 
  payload: { filePath, fileName: sanitizedFileName, userId: session.user.id },
});

    return NextResponse.json({ filePath });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
