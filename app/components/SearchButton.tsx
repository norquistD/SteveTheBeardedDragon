"use client";

import { useRouter } from "next/navigation";

export default function SearchButton() {
  const router = useRouter();

  const handleSearchClick = () => {
    router.push("/search");
  };

  return (
    <button
      onClick={handleSearchClick}
      className="language-button"
      aria-label="Search"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--cream)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    </button>
  );
}
