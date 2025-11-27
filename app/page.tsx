"use client";

import React, { useState } from "react";
import FileUpload from "@/components/ui/aevr/file-upload";
import { toast } from "sonner";
import { Copy, Link as LinkIcon, Folder } from "iconsax-react";
import { useSavedLinks } from "@/hooks/use-saved-links";
import { Button } from "@/components/ui/aevr/button";
import { InfoBox } from "@/components/ui/aevr/info-box";
import Link from "next/link";

export default function Home() {
  const [generatedLinks, setGeneratedLinks] = useState<
    Array<{ id: string; title: string; url: string }>
  >([]);
  const [textInput, setTextInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [createdGroup, setCreatedGroup] = useState<{
    name: string;
    count: number;
    id?: string;
  } | null>(null);
  const { saveLink, createGroup } = useSavedLinks();

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

  const handleUploadSuccess = (
    file: File,
    result?: Record<string, unknown>
  ) => {
    if (result && (result as { id: string }).id) {
      const id = (result as { id: string }).id;
      const url = `${window.location.origin}/view?id=${id}`;
      setGeneratedLinks((prev) => {
        if (prev.some((link) => link.id === id)) return prev;
        return [...prev, { id, title: file.name, url }];
      });
      saveLink(id, file.name);
    }
  };

  const handleFilesChange = () => {
    // We can use this to clear generated links if files are removed,
    // but for now let's just keep them.
    // Or we could sync them.
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
        const id = result.data.id;
        const url = `${window.location.origin}/view?id=${id}`;
        setGeneratedLinks((prev) => [
          ...prev,
          { id, title: "Untitled Markdown", url },
        ]);
        saveLink(id, "Untitled Markdown");
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

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    const linkIds = generatedLinks.map((l) => l.id);
    const newGroup = await createGroup(groupName, linkIds);

    if (newGroup) {
      setCreatedGroup({
        name: groupName,
        count: linkIds.length,
        id: newGroup.id,
      });
      toast.success(`Group "${groupName}" created!`);
      setGroupName("");

      // Scroll to top or show success message clearly
      window.scrollTo({ top: 0, behavior: "smooth" });
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
            onUploadSuccess={handleUploadSuccess}
            provider={uploadProvider}
            acceptedTypes={[".md", ".markdown", ".txt"]}
            maxFiles={10}
            multiple={true}
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
            className="h-48 w-full rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleTextUpload}
              disabled={isUploading || !textInput.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isUploading ? "Generating..." : "Generate Link"}
            </button>
          </div>
        </div>

        {createdGroup && (
          <InfoBox
            type="success"
            title={`Group "${createdGroup.name}" Created!`}
            description={
              <div className="space-y-2">
                <p>
                  Successfully grouped {createdGroup.count} links. You can
                  access this group anytime from the &quot;My Links&quot; menu
                  in the top right.
                </p>
                {createdGroup.id && (
                  <div className="mt-2 rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800">
                    <p className="text-xs font-medium text-zinc-500">
                      Shareable Link:
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 truncate text-xs text-zinc-700 dark:text-zinc-300">
                        {window.location.origin}/group/{createdGroup.id}
                      </code>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/group/${createdGroup.id}`
                          );
                          toast.success("Group link copied!");
                        }}
                      >
                        <Copy size={14} variant="Bulk" color="currentColor" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            }
            icon={<Folder variant="Bulk" size={24} color="currentColor" />}
            actions={[
              <Button
                key="dismiss"
                onClick={() => setCreatedGroup(null)}
                variant="secondary"
              >
                Dismiss
              </Button>,
            ]}
          />
        )}

        {generatedLinks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Generated Links
            </h2>

            {generatedLinks.length > 1 && (
              <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group Name"
                  className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <Button onClick={handleCreateGroup}>Create Group</Button>
              </div>
            )}

            <div className="grid gap-4">
              {generatedLinks.map((link) => (
                <InfoBox
                  key={link.id}
                  type={"success"}
                  title={link.title}
                  description={
                    <Link
                      href={link.url}
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      {link.url}
                    </Link>
                  }
                  icon={
                    <LinkIcon variant="Bulk" size={24} color="currentColor" />
                  }
                  actions={[
                    <Button
                      key={"copy"}
                      onClick={() => copyLink(link.url)}
                      variant={"secondary"}
                    >
                      <Copy size={16} color="currentColor" variant="Bulk" />
                      Copy
                    </Button>,
                  ]}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
