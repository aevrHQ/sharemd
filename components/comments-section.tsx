import React, { useState, useEffect } from "react";
import { useVisitor } from "@/hooks/use-visitor";
import { Button } from "./ui/aevr/button";
import { toast } from "sonner";
import { User, MessageAdd } from "iconsax-react";
import Loader from "./ui/aevr/loader";
import ResponsiveDialog from "./ui/aevr/responsive-dialog";

interface Comment {
  _id: string;
  content: string;
  visitor: {
    _id: string;
    name?: string;
  };
  createdAt: string;
}

interface CommentsSectionProps {
  markdownId: string;
}

export default function CommentsSection({ markdownId }: CommentsSectionProps) {
  const { visitor, isLoading: isVisitorLoading, updateName } = useVisitor();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [visitorNameInput, setVisitorNameInput] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (visitor?.name) {
      setVisitorNameInput(visitor.name);
    }
  }, [visitor]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/view/${markdownId}/comments`);
        const result = await response.json();
        if (result.success) {
          setComments(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchComments();
  }, [markdownId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitor || !newComment.trim()) return;

    setIsSubmitting(true);

    // Update name if changed
    if (visitorNameInput && visitorNameInput !== visitor.name) {
      await updateName(visitorNameInput);
    }

    try {
      const response = await fetch(`/api/view/${markdownId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          visitorId: visitor._id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setComments((prev) => [result.data, ...prev]);
        setNewComment("");
        toast.success("Comment added!");
        setIsDialogOpen(false);
      } else {
        toast.error(result.error || "Failed to add comment");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVisitorLoading || isLoadingComments) {
    return (
      <div className="py-4">
        <Loader loading={true} className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-neutral-200 pt-8 dark:border-neutral-800">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Comments ({comments.length})
        </h3>
        <ResponsiveDialog
          openPrompt={isDialogOpen}
          onOpenPromptChange={(open) => setIsDialogOpen(!!open)}
          title="Add a Comment"
          description="Share your thoughts on this document."
          trigger={
            <Button variant="secondary" className="gap-2">
              <MessageAdd size={18} variant="Bulk" color="currentColor" />
              <span>Add Comment</span>
            </Button>
          }
          drawerClose={
            <Button variant="secondary" className="w-full">
              Cancel
            </Button>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {!visitor?.name && (
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={visitorNameInput}
                  onChange={(e) => setVisitorNameInput(e.target.value)}
                  placeholder="Anonymous"
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Comment
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment here..."
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="w-full md:w-auto"
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        </ResponsiveDialog>
      </div>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment._id} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <User
                size={16}
                variant="Bulk"
                className="text-neutral-500"
                color="currentColor"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {comment.visitor.name || "Anonymous"}
                </span>
                <span className="text-xs text-neutral-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-sm text-neutral-500">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
}
