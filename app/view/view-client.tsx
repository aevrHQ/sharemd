"use client";

import React, { useState, useEffect } from "react";
import { Viewer } from "@/components/viewer";
import Loader from "@/components/ui/aevr/loader";
import { InfoBox } from "@/components/ui/aevr/info-box";
import { ArchiveBook, DocumentDownload, Share, Edit } from "iconsax-react";
import { toast } from "sonner";
import { useSavedLinks } from "@/hooks/use-saved-links";
import useShare from "@/hooks/aevr/use-share";
import Editor from "@/components/editor";
import { Button } from "@/components/ui/aevr/button";

interface ViewClientProps {
  initialContent?: string | null;
  id: string;
  initialError?: string | null;
}

export default function ViewClient({
  initialContent,
  id,
  initialError,
}: ViewClientProps) {
  const [content, setContent] = useState<string | null>(initialContent || null);
  const [loading, setLoading] = useState(!initialContent && !initialError);
  const [error, setError] = useState<string | null>(initialError || null);
  const { isSaved, saveLink, removeLink } = useSavedLinks();
  const { shareContent, isSharing } = useShare();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialContent || initialError) {
      setLoading(false);
      return;
    }

    const fetchContent = async () => {
      if (!id) {
        setError("No ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/view/${id}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch content");
        }
        setContent(result.data.content);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id, initialContent, initialError]);

  const handleShare = async () => {
    await shareContent(window.location.href, {
      title: "Markdown Viewer",
      description: "Check out this markdown file!",
      fallbackCopy: true,
    });
  };

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `markdown-${id || "file"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  };

  const handleBookmark = () => {
    if (!id) return;
    if (isSaved(id)) {
      removeLink(id);
      toast.success("Removed from saved links");
    } else {
      saveLink(id, "Saved Markdown");
      toast.success("Added to saved links");
    }
  };

  const handleSaveContent = async (newContent: string) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/view/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newContent }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to update content");
      }

      setContent(result.data.content);
      setIsEditing(false);
      toast.success("Content updated successfully!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader loading={true} className="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <InfoBox
          type="error"
          title="Error"
          description={error}
          className="max-w-md"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-2 py-8 lg:p-8 dark:bg-neutral-950">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-end gap-2">
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="secondary"
              className="gap-2"
              title="Edit Markdown"
            >
              <Edit size={18} variant="Bulk" color="currentColor" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          )}
          <Button
            onClick={handleShare}
            disabled={isSharing}
            variant="secondary"
            className="gap-2"
            title="Share Link"
          >
            <Share size={18} variant="Bulk" color="currentColor" />
            <span className="hidden sm:inline">
              {isSharing ? "Sharing..." : "Share"}
            </span>
          </Button>
          <Button
            onClick={handleDownload}
            variant="secondary"
            className="gap-2"
            title="Download Markdown"
          >
            <DocumentDownload size={18} variant="Bulk" color="currentColor" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button
            onClick={handleBookmark}
            variant={id && isSaved(id) ? "tertiary" : "secondary"}
            className="gap-2"
            title={id && isSaved(id) ? "Remove Bookmark" : "Bookmark"}
          >
            <ArchiveBook
              size={18}
              variant={id && isSaved(id) ? "Bold" : "Bulk"}
              color="currentColor"
            />
            <span className="hidden sm:inline">
              {id && isSaved(id) ? "Saved" : "Save"}
            </span>
          </Button>
        </div>
        {content && isEditing ? (
          <Editor
            initialContent={content}
            onSave={handleSaveContent}
            onCancel={() => setIsEditing(false)}
            isSaving={isSaving}
          />
        ) : (
          content && <Viewer content={content} />
        )}
      </div>
    </div>
  );
}
