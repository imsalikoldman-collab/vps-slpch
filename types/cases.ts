import type { RichDoc } from "@/types/psi";

export interface CaseBulletDTO {
  id: number;
  displayOrder: number;
  contentDoc: RichDoc;
}

export interface CaseCardDTO {
  id: number;
  displayOrder: number;
  title: string;
  meta: string;
  introDoc: RichDoc;
  conclusionDoc: RichDoc;
  bullets: CaseBulletDTO[];
}

export interface CaseBulletInput {
  displayOrder: number;
  contentDoc: RichDoc;
}

export interface CaseCardInput {
  displayOrder: number;
  title: string;
  meta: string;
  introDoc: RichDoc;
  conclusionDoc: RichDoc;
  bullets: CaseBulletInput[];
}
