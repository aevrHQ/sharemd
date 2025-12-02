import React, { Suspense } from "react";
import ViewClient from "./view-client";
import dbConnect from "@/lib/db";
import Markdown from "@/models/markdown";
import { Metadata } from "next";
import Loader from "@/components/ui/aevr/loader";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getMarkdown(id: string) {
  try {
    await dbConnect();
    const markdown = await Markdown.findById(id);
    if (!markdown) return null;
    return {
      content: markdown.content,
      title: markdown.title,
      createdAt: markdown.createdAt,
    };
  } catch (error) {
    console.error("Error fetching markdown:", error);
    return null;
  }
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { id } = await searchParams;

  if (!id || typeof id !== "string") {
    return {
      title: "View Markdown",
    };
  }

  const markdown = await getMarkdown(id);

  if (!markdown) {
    return {
      title: "Markdown Not Found",
    };
  }

  // Generate a brief description from content (first 150 chars)
  const description =
    markdown.content.slice(0, 150).replace(/[#*`]/g, "") + "...";

  const title = markdown.title || `View Markdown | ${id.substring(0, 8)}`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
    },
  };
}

export default async function ViewPage({ searchParams }: PageProps) {
  const { id } = await searchParams;
  let initialContent: string | null = null;
  let error: string | null = null;

  let markdown = null;
  if (id && typeof id === "string") {
    markdown = await getMarkdown(id);
    if (markdown) {
      initialContent = markdown.content;
    } else {
      error = "Markdown not found";
    }
  } else {
    error = "No ID provided";
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader loading={true} />
        </div>
      }
    >
      <ViewClient
        id={typeof id === "string" ? id : ""}
        initialContent={initialContent}
        initialTitle={markdown?.title}
        initialError={error}
      />
    </Suspense>
  );
}
