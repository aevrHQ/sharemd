"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Viewer } from "@/components/viewer";
import Loader from "@/components/ui/aevr/loader";
import { InfoBox } from "@/components/ui/aevr/info-box";

function ViewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [id]);

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
    <div className="min-h-screen bg-white p-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl">
        {content && <Viewer content={content} />}
      </div>
    </div>
  );
}

export default function ViewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader loading={true} />
        </div>
      }
    >
      <ViewContent />
    </Suspense>
  );
}
