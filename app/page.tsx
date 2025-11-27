"use client";

import React, { useState } from "react";
import FileUpload, { UploadedFile } from "@/components/ui/aevr/file-upload";
import { toast } from "sonner";
import { Copy, Link as LinkIcon } from "iconsax-react";

export default function Home() {
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // We need to construct the provider manually because s3Uploader is an instance,
  // but FileUpload expects a provider object that matches the interface.
  // The s3Uploader instance matches the interface mostly, but let's be safe and use the class if possible
  // or just wrap the instance.
  // Looking at s3-uploader.ts, it exports the class S3Uploader and an instance s3Uploader.
  // FileUpload expects an object with `uploadFile` method.
  // Let's check s3-uploader.ts again. It has uploadFile method.
  // However, FileUpload component imports S3Provider from itself (which is a class).
  // But we can pass any object that implements UploadProvider interface.
  // s3Uploader instance has uploadFile method.
  // Let's wrap it to be sure it matches UploadProvider interface.

  const uploadProvider = {
    name: "mongodb",
    uploadFile: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      return {
        success: result.success,
        data: result.data, // Contains { id: "..." }
        error: result.error,
      };
    },
  };

  const handleFilesChange = (files: UploadedFile[]) => {
    if (files.length > 0 && files[0].uploadResult) {
      const fileData = files[0].uploadResult as { id: string };
      if (fileData.id) {
        generateLink(fileData.id);
      }
    }
  };

  const handleTextUpload = async () => {
    if (!textInput.trim()) {
      toast.error("Please enter some markdown text");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("text", textInput);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        generateLink(result.data.id);
        toast.success("Text uploaded successfully!");
      } else {
        toast.error(result.error || "Failed to upload text");
      }
    } catch (error) {
      toast.error("An error occurred during upload");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const generateLink = (id: string) => {
    const link = `${window.location.origin}/view?id=${id}`;
    setGeneratedLink(link);
  };

  const copyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Markdown Share
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Upload a file or paste markdown to generate a shareable link.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Upload File
          </h2>
          <FileUpload
            onFilesChange={handleFilesChange}
            provider={uploadProvider}
            acceptedTypes={[".md", ".markdown", ".txt"]}
            maxFiles={1}
            title="Drop markdown file here"
          />
        </div>

        <div className="relative flex items-center py-4">
          <div className="grow border-t border-zinc-200 dark:border-zinc-800"></div>
          <span className="mx-4 shrink-0 text-zinc-400">OR</span>
          <div className="grow border-t border-zinc-200 dark:border-zinc-800"></div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Paste Markdown
          </h2>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="# Paste your markdown here..."
            className="h-48 w-full rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleTextUpload}
              disabled={isUploading || !textInput.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? "Generating..." : "Generate Link"}
            </button>
          </div>
        </div>

        {generatedLink && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900/30 dark:bg-green-900/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <LinkIcon variant="Bulk" size={24} color="currentColor" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Your link is ready!
                </p>
                <p className="truncate text-xs text-green-700 dark:text-green-300">
                  {generatedLink}
                </p>
              </div>
              <button
                onClick={copyLink}
                className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <Copy size={16} color="currentColor" variant="Bulk" />
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
