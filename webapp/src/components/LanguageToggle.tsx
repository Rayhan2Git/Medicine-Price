import type { Lang } from "../i18n";

interface Props {
  lang: Lang;
  onChange: (lang: Lang) => void;
}

export function LanguageToggle({ lang, onChange }: Props) {
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      <button
        type="button"
        className={lang === "en" ? "active" : ""}
        onClick={() => onChange("en")}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        type="button"
        className={lang === "bn" ? "active" : ""}
        onClick={() => onChange("bn")}
        aria-pressed={lang === "bn"}
      >
        বাং
      </button>
    </div>
  );
}
