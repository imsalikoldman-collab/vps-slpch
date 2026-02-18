import type { RichDoc } from "@/types/psi";

export interface PartnerBulletDTO {
  id: number;
  displayOrder: number;
  contentDoc: RichDoc;
}

export interface PartnerCardDTO {
  id: number;
  displayOrder: number;
  title: string;
  titleHref: string | null;
  introDoc: RichDoc;
  conclusionDoc: RichDoc;
  bullets: PartnerBulletDTO[];
}

export interface PartnerBulletInput {
  displayOrder: number;
  contentDoc: RichDoc;
}

export interface PartnerCardInput {
  displayOrder: number;
  title: string;
  titleHref?: string | null;
  introDoc: RichDoc;
  conclusionDoc: RichDoc;
  bullets: PartnerBulletInput[];
}
