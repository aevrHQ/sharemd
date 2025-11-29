"use client";

import React from "react";
import { Share } from "iconsax-react";
import useShare from "@/hooks/aevr/use-share";

interface GroupShareButtonProps {
  groupId: string;
  title: string;
}

export default function GroupShareButton({
  groupId,
  title,
}: GroupShareButtonProps) {
  const { shareContent, isSharing } = useShare();

  const handleShare = async () => {
    const url = `${window.location.origin}/group/${groupId}`;
    await shareContent(url, {
      title: `Group: ${title}`,
      description: `Check out this group of markdown files: ${title}`,
      fallbackCopy: true,
    });
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
      title="Share Group Link"
    >
      <Share size={18} variant="Bulk" color="currentColor" />
      <span className="hidden sm:inline">
        {isSharing ? "Sharing..." : "Share"}
      </span>
    </button>
  );
}
