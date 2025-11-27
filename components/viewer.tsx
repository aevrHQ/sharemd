"use client";

import React, { useEffect, useState } from "react";
import { marked } from "marked";

interface ViewerProps {
  content: string;
  className?: string;
}

export const Viewer: React.FC<ViewerProps> = ({ content, className = "" }) => {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    const parseMarkdown = async () => {
      const parsed = await marked.parse(content);
      setHtml(parsed);
    };
    parseMarkdown();
  }, [content]);

  return (
    <div
      className={`prose prose-zinc dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
