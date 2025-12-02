import React, { useState, useEffect, useRef } from "react";
import { useVisitor } from "@/hooks/use-visitor";
import { Add } from "iconsax-react";
import { Button } from "./ui/aevr/button";
import { cn } from "@/lib/utils";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface ReactionButtonProps {
  markdownId: string;
}

export default function ReactionButton({ markdownId }: ReactionButtonProps) {
  const { visitor } = useVisitor();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchReactions = async () => {
      if (!visitor) return;
      try {
        const response = await fetch(
          `/api/view/${markdownId}/reactions?visitorId=${visitor._id}`
        );
        const result = await response.json();
        if (result.success) {
          setCounts(result.data.counts);
          setUserReactions(result.data.userReactions);
        }
      } catch (error) {
        console.error("Failed to fetch reactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReactions();
  }, [markdownId, visitor]);

  const handleToggle = async (emoji: string) => {
    if (!visitor) return;

    // Optimistic update
    const isReacted = userReactions.includes(emoji);
    const newReactions = isReacted
      ? userReactions.filter((r) => r !== emoji)
      : [...userReactions, emoji];

    setUserReactions(newReactions);

    setCounts((prev) => {
      const newCounts = { ...prev };
      if (isReacted) {
        newCounts[emoji] = (newCounts[emoji] || 1) - 1;
        if (newCounts[emoji] <= 0) delete newCounts[emoji];
      } else {
        newCounts[emoji] = (newCounts[emoji] || 0) + 1;
      }
      return newCounts;
    });

    setShowPicker(false);

    try {
      const response = await fetch(`/api/view/${markdownId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitorId: visitor._id,
          type: emoji,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        // Revert on failure (simplified)
        console.error("Failed to toggle reaction");
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="relative flex items-center gap-2">
      {Object.entries(counts).map(([emoji, count]) => (
        <Button
          key={emoji}
          variant="secondary"
          onClick={() => handleToggle(emoji)}
          className={cn(
            "gap-2 transition-colors px-3",
            userReactions.includes(emoji) &&
              "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
          )}
        >
          <span className="text-lg leading-none">{emoji}</span>
          <span className="text-xs font-medium">{count}</span>
        </Button>
      ))}

      <div className="relative" ref={pickerRef}>
        <Button
          variant="secondary"
          onClick={() => setShowPicker(!showPicker)}
          className="px-2"
          title="Add Reaction"
        >
          <Add size={18} variant="Bulk" color="currentColor" />
        </Button>

        {showPicker && (
          <div className="absolute top-full right-0 mt-2 z-50 shadow-xl rounded-xl overflow-hidden">
            <Picker
              data={data}
              onEmojiSelect={(emoji: { native: string }) =>
                handleToggle(emoji.native)
              }
              theme="auto"
              previewPosition="none"
              skinTonePosition="none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
