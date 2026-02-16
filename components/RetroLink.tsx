"use client";

import { usePathname, useRouter } from "next/navigation";
import { type MouseEvent, type ReactNode } from "react";

import { useFx } from "@/context/FxContext";

interface RetroLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  title?: string;
}

export default function RetroLink({ href, className, children, title }: RetroLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { playClick, playTransition, transitionActive } = useFx();

  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    if (transitionActive) {
      return;
    }

    playClick();
    if (pathname === href) {
      return;
    }

    await playTransition();
    router.push(href);
  };

  return (
    <a href={href} className={className} onClick={handleClick} title={title}>
      {children}
    </a>
  );
}
