"use client";

import {
  useEditor,
  EditorContent,
  type Editor as EditorType,
} from "@tiptap/react";
import { DOMParser as ProseMirrorDOMParser } from "@tiptap/pm/model";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
} from "lucide-react";
import { marked } from "marked";
import { useEffect, useState, useRef } from "react";
import Loader from "./ui/aevr/loader";
import { CloseCircle, TickCircle } from "iconsax-react";
import { Button } from "./ui/aevr/button";
import { usePersistedState } from "@/hooks/aevr/use-persisted-state";

interface EditorProps {
  initialContent?: string;
  onSave: (content: string) => void | Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
  persistenceKey?: string;
  saveButtonText?: string;
}

const MenuBar = ({ editor }: { editor: EditorType | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 border-b border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-900/50">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 ${
          editor.isActive("bold") ? "bg-neutral-200 dark:bg-neutral-800" : ""
        }`}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 ${
          editor.isActive("italic") ? "bg-neutral-200 dark:bg-neutral-800" : ""
        }`}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 ${
          editor.isActive("strike") ? "bg-neutral-200 dark:bg-neutral-800" : ""
        }`}
        title="Strikethrough"
      >
        <Strikethrough size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 ${
          editor.isActive("code") ? "bg-neutral-200 dark:bg-neutral-800" : ""
        }`}
        title="Code"
      >
        <Code size={18} />
      </button>
      <div className="mx-1 w-px bg-neutral-300 dark:bg-neutral-700" />
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 ${
          editor.isActive("heading", { level: 1 })
            ? "bg-neutral-200 dark:bg-neutral-800"
            : ""
        }`}
        title="Heading 1"
      >
        <Heading1 size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 ${
          editor.isActive("heading", { level: 2 })
            ? "bg-neutral-200 dark:bg-neutral-800"
            : ""
        }`}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 ${
          editor.isActive("heading", { level: 3 })
            ? "bg-neutral-200 dark:bg-neutral-800"
            : ""
        }`}
        title="Heading 3"
      >
        <Heading3 size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={`rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 ${
          editor.isActive("heading", { level: 4 })
            ? "bg-neutral-200 dark:bg-neutral-800"
            : ""
        }`}
        title="Heading 4"
      >
        <Heading4 size={18} />
      </button>
      <div className="mx-1 w-px bg-neutral-300 dark:bg-neutral-700" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 ${
          editor.isActive("bulletList")
            ? "bg-neutral-200 dark:bg-neutral-800"
            : ""
        }`}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 ${
          editor.isActive("orderedList")
            ? "bg-neutral-200 dark:bg-neutral-800"
            : ""
        }`}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 ${
          editor.isActive("blockquote")
            ? "bg-neutral-200 dark:bg-neutral-800"
            : ""
        }`}
        title="Blockquote"
      >
        <Quote size={18} />
      </button>
      <div className="mx-1 w-px bg-neutral-300 dark:bg-neutral-700" />
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="rounded p-1 hover:bg-neutral-200 disabled:opacity-50 dark:hover:bg-neutral-800"
        title="Undo"
      >
        <Undo size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="rounded p-1 hover:bg-neutral-200 disabled:opacity-50 dark:hover:bg-neutral-800"
        title="Redo"
      >
        <Redo size={18} />
      </button>
    </div>
  );
};

export default function Editor({
  initialContent = "",
  onSave,
  onCancel,
  isSaving = false,
  saveButtonText = "Save Changes",
  persistenceKey,
}: EditorProps) {
  // Use a fallback key if none provided, but disable persistence in that case
  const fallbackKey = "editor-fallback-key";
  const {
    state: persistedHtml,
    setState: setPersistedHtml,
    resetState,
  } = usePersistedState<string>("", {
    storageKey: persistenceKey || fallbackKey,
    enablePersistence: !!persistenceKey,
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],
    content: "", // Initial content will be set via useEffect
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none",
      },
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData("text/plain");
        const html = event.clipboardData?.getData("text/html");

        // Heuristic: If the clipboard contains rich text (HTML with formatting tags),
        // we let the editor handle it natively to preserve formatting.
        // We look for common formatting tags.
        const isRichText =
          html &&
          /<(?:h[1-6]|b|strong|i|em|u|s|strike|ul|ol|li|blockquote|a|img|table|tr|td|th)\b/i.test(
            html
          );

        if (text && !isRichText) {
          event.preventDefault();
          Promise.resolve(marked.parse(text)).then((html) => {
            const element = document.createElement("div");
            element.innerHTML = html;
            const slice = ProseMirrorDOMParser.fromSchema(
              view.state.schema
            ).parseSlice(element);
            view.dispatch(view.state.tr.replaceSelection(slice));
          });
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      // Force re-render to update button state
      editor.isActive("bold");

      // Sync to persisted state
      setPersistedHtml(editor.getHTML());
    },
  });

  // We need to track empty state to disable the button
  const [isEmpty, setIsEmpty] = useState(true);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (editor) {
      const updateEmptyState = () => {
        setIsEmpty(editor.isEmpty);
      };

      editor.on("update", updateEmptyState);

      return () => {
        editor.off("update", updateEmptyState);
      };
    }
  }, [editor]);

  // Sync initialContent to persistedHtml (and thus to editor)
  useEffect(() => {
    const syncInitialContent = async () => {
      // On first render, if initialContent is empty, we DON'T want to overwrite persistedHtml
      // because we want to load the saved state.
      if (isFirstRender.current) {
        isFirstRender.current = false;
        if (!initialContent) {
          return;
        }
      }

      // If initialContent is provided (or changed later), we update the state.
      // This handles "Reset" (when initialContent becomes "") and "Edit File" (when initialContent has value).
      if (initialContent !== undefined) {
        const html = await marked.parse(initialContent);
        setPersistedHtml(html);
      }
    };
    syncInitialContent();
  }, [initialContent, setPersistedHtml]);

  // Sync persistedHtml to editor
  useEffect(() => {
    if (editor && persistedHtml !== undefined) {
      // Only update if content is different to avoid cursor jumps
      if (editor.getHTML() !== persistedHtml) {
        editor.commands.setContent(persistedHtml);
      }
    }
  }, [editor, persistedHtml]);

  if (!editor) {
    return null;
  }

  const handleSave = async () => {
    // We await the onSave callback. If it succeeds (doesn't throw), we reset the state.
    try {
      await onSave(editor.getHTML());
      resetState();
    } catch (error) {
      console.error("Save failed:", error);
      // Do not reset state if save fails
    }
  };

  return (
    <div className="relative rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="rounded-t-lg overflow-hidden">
        <MenuBar editor={editor} />
      </div>
      <EditorContent editor={editor} />
      <div className="sticky bottom-4 z-10 flex justify-end px-4 pb-2 pointer-events-none">
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white/80 p-2 shadow-lg backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80 pointer-events-auto">
          <Button onClick={onCancel} disabled={isSaving} variant={"secondary"}>
            <CloseCircle
              className="icon w-5 h-5"
              variant="Bulk"
              color="currentColor"
            />
            <span>Cancel</span>
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isEmpty}>
            {isSaving ? (
              <>
                <Loader loading />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <TickCircle
                  color="currentColor"
                  variant="Bulk"
                  className="icon w-5 h-5"
                />
                <span>{saveButtonText}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
