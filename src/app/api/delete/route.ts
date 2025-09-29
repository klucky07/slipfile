import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/SupabaseClient";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filePath } = await req.json();

  try {
   
    const { error: deleteError } = await supabaseAdmin.storage
      .from("user-files")
      .remove([filePath]);

    if (deleteError) {
      console.error("Error deleting file:", deleteError);
      return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
    }

    const channel = supabaseAdmin.channel("file-transfers");
    await channel.send({
      type: "broadcast",
      event: "file_downloaded_deleted",
      payload: { filePath, userId: session.user.id },
    });

    return NextResponse.json({ success: true, message: "File deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}