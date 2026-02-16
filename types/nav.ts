import type { RouteKey } from "@/types/site";

export interface NavItem {
  key: RouteKey;
  href: string;
  label: string;
}
