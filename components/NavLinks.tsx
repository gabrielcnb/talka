"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/vocabulary", label: "Vocabulary" },
  { href: "/grammar", label: "Grammar" },
  { href: "/dictation", label: "Dictation" },
  { href: "/pronunciation", label: "Pronunciation" },
];

export default function NavLinks() {
  const pathname = usePathname();

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
