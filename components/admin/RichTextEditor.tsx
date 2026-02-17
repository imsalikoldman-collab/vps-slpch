"use client";

import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useMemo } from "react";

import { ClassifiedMark } from "@/lib/tiptap-classified";
import type { RichDoc } from "@/types/psi";

interface RichTextEditorProps {
  value: RichDoc;
  onChange: (value: RichDoc) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const valueHash = useMemo(() => JSON.stringify(value), [value]);

  const editor = useEditor({
    extensions: [StarterKit, ClassifiedMark],
    content: value,
    editorProps: {
      attributes: {
        class: "admin-editor-content",
      },
    },
    onUpdate: ({ editor: editorInstance }) => {
      onChange(editorInstance.getJSON() as RichDoc);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const current = JSON.stringify(editor.getJSON());
    if (current !== valueHash) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value, valueHash]);

  if (!editor) {
    return <div className="admin-editor-skeleton">LOADING EDITOR...</div>;
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-toolbar">
        <button
          type="button"
          className={editor.isActive("bold") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          type="button"
          className={editor.isActive("italic") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>
        <button
          type="button"
          className={editor.isActive("classified") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleMark("classified").run()}
        >
          Classified
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
