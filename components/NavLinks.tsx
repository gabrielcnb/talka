"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/app/i18n/useTranslation";

export default function NavLinks() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const links = [
    { href: "/vocabulary", label: t("nav_vocabulary") },
    { href: "/grammar", label: t("nav_grammar") },
    { href: "/dictation", label: t("nav_dictation") },
    { href: "/quiz", label: t("nav_quiz") },
    { href: "/pronunciation", label: t("nav_pronunciation") },
    { href: "/flashcards", label: t("nav_flashcards") },
  ];

  return (
    <div className="hidden md:flex items-center gap-1">
      {links.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-white/20 text-white shadow-sm"
                : "text-indigo-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
