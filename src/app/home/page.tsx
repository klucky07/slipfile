"use client";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/SupabaseClient";

export default function Page() {
  const [uploadedFilePath, setUploadedFilePath] = useState("");
  const router = useRouter();

  async function signOut() {
    await authClient.signOut({ fetchOptions: { onSuccess: () => router.push("/") } });
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const input = document.getElementById("file") as HTMLInputElement;
    if (!input.files?.[0]) return;

    const formData = new FormData();
    formData.append("file", input.files[0]);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.filePath) setUploadedFilePath(data.filePath);
  }

  async function handleDownload() {
    if (!uploadedFilePath) return;

    const res = await fetch("/api/download", {
      method: "POST",
      body: JSON.stringify({ filePath: uploadedFilePath }),
      headers: { "Content-Type": "application/json" },
    });

    const { url } = await res.json();
    if (!url) return;

    const blob = await (await fetch(url)).blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = uploadedFilePath.split("/").pop() || "downloaded-file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  // Realtime subscription

useEffect(() => {
  try {
    const channel = supabase
      .channel("file-transfers")
      .on("broadcast", { event: "file_uploaded" }, (payload) => {
        setUploadedFilePath(payload.payload.filePath);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Error setting up Supabase channel:', error);
  }
}, []);

  return (
    <div className="grid grid-cols-2 gap-8 p-8">
      {/* Upload */}
      <div className="border p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Upload File (Mobile)</h2>
        <form>
          <input type="file" id="file" />
          <button onClick={handleUpload} type="submit" className="ml-2 px-4 py-1 bg-blue-600 text-white rounded">
            Upload
          </button>
        </form>
        {uploadedFilePath && <p className="mt-2 text-sm text-green-600">File uploaded successfully.</p>}
      </div>

      {/* Download */}
      <div className="border p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Download File (Laptop)</h2>
        <button
          onClick={handleDownload}
          disabled={!uploadedFilePath}
          className={`px-4 py-1 rounded ${
            uploadedFilePath ? "bg-green-600 text-white" : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
        >
          Download
        </button>
        <div className="mt-4">
          <button onClick={signOut} className="px-4 py-1 bg-red-600 text-white rounded">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
