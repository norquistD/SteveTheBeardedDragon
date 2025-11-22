"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import "./BackButton.css";

export default function BackButton() {
  const router = useRouter();
  const t = useTranslations("navigation");

  return (
    <button onClick={() => router.back()} className="back-button">
      ← {t("back")}
    </button>
  );
}
