import type { ReactNode } from "react";

import Redacted from "@/components/Redacted";
import type { ClearanceLevel, RichDoc, RichTextNode } from "@/types/psi";

const PUBLIC_MASK = "██████";

function hasMark(node: RichTextNode, type: string): boolean {
  return node.marks?.some((mark) => mark.type === type) ?? false;
}

function renderTextNode(node: RichTextNode, clearance: ClearanceLevel, key: string): ReactNode {
  const text = node.text ?? "";
  const classified = hasMark(node, "classified");
  const bold = hasMark(node, "bold");
  const italic = hasMark(node, "italic");

  let content: ReactNode = classified && clearance === "public" ? <Redacted>{PUBLIC_MASK}</Redacted> : text;

  if (classified && clearance === "high") {
    content = <span className="classified-visible">{content}</span>;
  }
  if (bold) {
    content = <strong>{content}</strong>;
  }
  if (italic) {
    content = <em>{content}</em>;
  }

  return <span key={key}>{content}</span>;
}

function renderInline(nodes: RichTextNode[] | undefined, clearance: ClearanceLevel, keyPrefix: string): ReactNode {
  if (!nodes?.length) {
    return null;
  }

  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    if (node.type === "text") {
      return renderTextNode(node, clearance, key);
    }

    if (node.type === "hardBreak") {
      return <br key={key} />;
    }

    if (node.content?.length) {
      return <span key={key}>{renderInline(node.content, clearance, key)}</span>;
    }

    return null;
  });
}

function renderBlocks(nodes: RichTextNode[] | undefined, clearance: ClearanceLevel, keyPrefix: string): ReactNode {
  if (!nodes?.length) {
    return null;
  }

  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;

    if (node.type === "paragraph") {
      return <p key={key}>{renderInline(node.content, clearance, key)}</p>;
    }

    if (node.type === "bulletList") {
      return <ul key={key}>{renderBlocks(node.content, clearance, key)}</ul>;
    }

    if (node.type === "orderedList") {
      return <ol key={key}>{renderBlocks(node.content, clearance, key)}</ol>;
    }

    if (node.type === "listItem") {
      return <li key={key}>{renderInline(node.content, clearance, key)}</li>;
    }

    if (node.type === "text") {
      return (
        <p key={key}>
          {renderTextNode(node, clearance, key)}
        </p>
      );
    }

    return <p key={key}>{renderInline(node.content, clearance, key)}</p>;
  });
}

export function renderRichDoc(doc: RichDoc, clearance: ClearanceLevel, keyPrefix: string): ReactNode {
  return renderBlocks(doc.content, clearance, keyPrefix);
}
