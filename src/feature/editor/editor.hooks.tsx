import { memo, useState } from 'react'

export const useEditor = (initialValue?: string) => {
  const [value, setValue] = useState(initialValue ?? '')

  const onChange = (v: string) => {
    setValue(v.trim())
  }

  return { onChange, value }
}

const Wrap = memo(function Wrap(props: {
  wordWrap: boolean
  setWordWrap: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2 text-base text-muted hover:text-[--text]">
      <input
        checked={props.wordWrap}
        className="hidden"
        onChange={e => {
          props.setWordWrap(e.target.checked)
        }}
        type="checkbox"
      />
      <svg
        className="h-[1em] w-[1em] text-lg"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
          stroke="var(--input-border)"
        />
        {!!props.wordWrap && <path d="m9 12 2 2 4-4" />}
      </svg>
      Wrap
    </label>
  )
})

export const useEditorWrap: (
  initialValue: boolean
) => [boolean, () => JSX.Element] = initialValue => {
  const [wordWrap, setWordWrap] = useState(initialValue)

  return [
    wordWrap,
    () => <Wrap wordWrap={wordWrap} setWordWrap={setWordWrap} />,
  ]
}
