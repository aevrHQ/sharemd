"use client";

import React, { useState } from "react";
import FileUpload from "@/components/ui/aevr/file-upload";
import { toast } from "sonner";
import { Copy, Link as LinkIcon, Folder, Eye } from "iconsax-react";
import { useSavedLinks } from "@/hooks/use-saved-links";
import { Button } from "@/components/ui/aevr/button";
import { InfoBox } from "@/components/ui/aevr/info-box";
import Link from "next/link";
import ResponsiveDialog from "@/components/ui/aevr/responsive-dialog";

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
  const [isGrouping, setIsGrouping] = useState(false);
  const [showGeneratedLinksDialog, setShowGeneratedLinksDialog] =
    useState(false);
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
      setShowGeneratedLinksDialog(true);
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
        setShowGeneratedLinksDialog(true);
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
    setIsGrouping(true);
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

      // // Scroll to top or show success message clearly
      // window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsGrouping(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-2 lg:p-8 dark:bg-neutral-950">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Markdown Share
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Upload a file or paste markdown to generate a shareable link.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
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
          <div className="grow border-t border-neutral-200 dark:border-neutral-800"></div>
          <span className="mx-4 shrink-0 text-neutral-400">OR</span>
          <div className="grow border-t border-neutral-200 dark:border-neutral-800"></div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Paste Markdown
          </h2>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="# Paste your markdown here..."
            className="h-48 w-full rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
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

        {generatedLinks.length > 0 && !showGeneratedLinksDialog && (
          <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Button
              onClick={() => setShowGeneratedLinksDialog(true)}
              variant="secondary"
              className="gap-2 shadow-sm"
            >
              <LinkIcon size={18} variant="Bulk" color="currentColor" />
              View Generated Links ({generatedLinks.length})
            </Button>
          </div>
        )}

        <ResponsiveDialog
          openPrompt={showGeneratedLinksDialog}
          onOpenPromptChange={(open) =>
            setShowGeneratedLinksDialog(open ?? false)
          }
          title="Generated Links"
          description="Here are your shareable links. You can group them for easier sharing."
        >
          <div className="space-y-6">
            {createdGroup && (
              <InfoBox
                type="success"
                title={`Group "${createdGroup.name}" Created!`}
                description={
                  <div className="space-y-2">
                    <p>
                      Successfully grouped {createdGroup.count} links. You can
                      access this group anytime from the &quot;My Links&quot;
                      menu in the top right.
                    </p>
                    {createdGroup.id && (
                      <div className="mt-2 rounded-lg bg-neutral-100 p-2 dark:bg-neutral-800">
                        <p className="text-xs font-medium text-neutral-500">
                          Shareable Link:
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <code className="flex-1 truncate text-xs text-neutral-700 dark:text-neutral-300">
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
                            <Copy
                              size={14}
                              variant="Bulk"
                              color="currentColor"
                            />
                          </Button>
                          <Button size={"sm"} asChild>
                            <Link
                              href={`${window.location.origin}/group/${createdGroup.id}`}
                            >
                              <Eye
                                size={14}
                                variant="Bulk"
                                color="currentColor"
                              />
                            </Link>
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
                {generatedLinks.length > 1 && (
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Group Name"
                      className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    />
                    <Button className="max-sm:grow" onClick={handleCreateGroup}>
                      {isGrouping ? "Grouping..." : "Create Group"}
                    </Button>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {generatedLinks.map((link) => (
                    <InfoBox
                      key={link.id}
                      type={"success"}
                      title={
                        <span className="block truncate">{link.title}</span>
                      }
                      description={
                        <Link
                          href={link.url}
                          target="_blank"
                          className="block truncate text-blue-600 hover:underline"
                        >
                          {link.url}
                        </Link>
                      }
                      icon={
                        <LinkIcon
                          variant="Bulk"
                          size={24}
                          color="currentColor"
                        />
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
        </ResponsiveDialog>
      </div>
    </div>
  );
}
