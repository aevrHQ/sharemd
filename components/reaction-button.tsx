import React, { useState, useEffect } from "react";
import { useVisitor } from "@/hooks/use-visitor";
import { Heart } from "iconsax-react";
import { Button } from "./ui/aevr/button";
import { cn } from "@/lib/utils";

interface ReactionButtonProps {
  markdownId: string;
}

export default function ReactionButton({ markdownId }: ReactionButtonProps) {
  const { visitor } = useVisitor();
  const [count, setCount] = useState(0);
  const [hasReacted, setHasReacted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReactions = async () => {
      if (!visitor) return;
      try {
        const response = await fetch(
          `/api/view/${markdownId}/reactions?visitorId=${visitor._id}`
        );
        const result = await response.json();
        if (result.success) {
          setCount(result.data.count);
          setHasReacted(result.data.userReacted);
        }
      } catch (error) {
        console.error("Failed to fetch reactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReactions();
  }, [markdownId, visitor]);

  const handleToggle = async () => {
    if (!visitor) return;

    // Optimistic update
    const newHasReacted = !hasReacted;
    setHasReacted(newHasReacted);
    setCount((prev) => (newHasReacted ? prev + 1 : prev - 1));

    try {
      const response = await fetch(`/api/view/${markdownId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitorId: visitor._id,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        // Revert on failure
        setHasReacted(!newHasReacted);
        setCount((prev) => (newHasReacted ? prev - 1 : prev + 1));
      }
    } catch (error) {
      // Revert on failure
      setHasReacted(!newHasReacted);
      setCount((prev) => (newHasReacted ? prev - 1 : prev + 1));
    }
  };

  if (isLoading) {
    return null; // Or a skeleton
  }

  return (
    <Button
      variant="secondary"
      onClick={handleToggle}
      className={cn(
        "gap-2 transition-colors",
        hasReacted &&
          "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50"
      )}
    >
      <Heart
        size={18}
        variant={hasReacted ? "Bold" : "Bulk"}
        className={cn(hasReacted && "fill-current")}
        color="currentColor"
      />
      <span>{count}</span>
    </Button>
  );
}
