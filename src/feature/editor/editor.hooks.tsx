import { useState } from "react";

export const useEditor = (initialValue?: string) => {
  const [value, setValue] = useState(initialValue ?? "");

  const onChange = (value: string) => {
    setValue(value.trim());
  };

  return { onChange, value };
};

export const useEditorWrap: (
  initialValue: boolean
) => [boolean, () => JSX.Element] = (initialValue) => {
  const [wordWrap, setWordWrap] = useState(initialValue);

  return [
    wordWrap,
    () => (
      <label className="text-base flex items-center gap-2 text-[--text-muted] hover:text-[--text] cursor-pointer select-none">
        <input
          type="checkbox"
          className="hidden"
          checked={wordWrap}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setWordWrap(e.target.checked);
          }}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[1em] h-[1em] text-lg"
        >
          <path
            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
            stroke="var(--input-border)"
          />
          {wordWrap && <path d="m9 12 2 2 4-4" />}
        </svg>
        Wrap
      </label>
    ),
  ];
};
