export type ClearanceLevel = "public" | "high";

export interface RichTextMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface RichTextNode {
  type: string;
  text?: string;
  marks?: RichTextMark[];
  content?: RichTextNode[];
  attrs?: Record<string, unknown>;
}

export interface RichDoc {
  type: "doc";
  content: RichTextNode[];
}

export interface PsiBulletDTO {
  id: number;
  displayOrder: number;
  contentDoc: RichDoc;
}

export interface PsiCardDTO {
  id: number;
  displayOrder: number;
  name: string;
  nameHref: string | null;
  age: number | null;
  citizenship: string;
  status: string;
  photoPath: string | null;
  photoAlt: string | null;
  introDoc: RichDoc;
  conclusionDoc: RichDoc;
  bullets: PsiBulletDTO[];
}

export interface PsiBulletInput {
  displayOrder: number;
  contentDoc: RichDoc;
}

export interface PsiCardInput {
  displayOrder: number;
  name: string;
  nameHref?: string | null;
  age?: number | null;
  citizenship: string;
  status: string;
  photoPath?: string | null;
  photoAlt?: string | null;
  introDoc: RichDoc;
  conclusionDoc: RichDoc;
  bullets: PsiBulletInput[];
}

export function createEmptyRichDoc(): RichDoc {
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [] }],
  };
}
