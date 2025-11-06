"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UploadCloud, ArrowLeft } from "lucide-react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first.");
    setLoading(true);

    // Simulate upload
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl border border-border bg-card/30 backdrop-blur-md rounded-2xl shadow-lg p-8 space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="
                text-emerald-500 
                border-emerald-500 
                hover:bg-emerald-600 
                hover:border-emerald-600 
                hover:text-white 
                active:bg-emerald-700 
                transition-all 
                duration-200 
                ease-in-out 
                transform 
                hover:scale-105
              "
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-lg">
              <UploadCloud className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Upload Notes</h1>
          <p className="text-sm text-muted-foreground">
            Upload your notes to automatically summarize them.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 flex flex-col items-center"
        >
          <input
            type="text"
            placeholder="Optional title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="
              w-full rounded-md border border-zinc-700 bg-zinc-900 
              text-white placeholder-zinc-500 px-3 py-2 
              focus:outline-none focus:ring-2 focus:ring-emerald-500
            "
          />

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="
              w-full border-2 border-dashed border-zinc-700 rounded-xl 
              bg-zinc-900/40 hover:bg-zinc-900/60 
              transition-all duration-200 flex flex-col items-center justify-center 
              p-10 text-center cursor-pointer
            "
          >
            <UploadCloud className="h-10 w-10 text-zinc-500 mb-2" />
            <p className="text-zinc-400">
              {file ? (
                <>
                  <span className="text-white font-medium">{file.name}</span>
                  <span className="text-zinc-500"> selected</span>
                </>
              ) : (
                "Drag and drop your file here"
              )}
            </p>

            <div className="mt-4">
              <label
                htmlFor="file-upload"
                className="
                  text-emerald-400 hover:text-emerald-300 cursor-pointer text-sm underline
                "
              >
                or click here
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.txt,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading || !file}
            className="
              w-full mt-6 bg-emerald-600 hover:bg-emerald-500 
              text-white text-base font-semibold py-3 rounded-md 
              transition-all duration-200 ease-in-out
            "
          >
            {loading ? "Uploading..." : "Upload & Summarize"}
          </Button>
        </form>
      </div>
    </div>
  );
}