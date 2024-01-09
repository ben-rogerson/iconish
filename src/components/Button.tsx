export const Button = (props: {
  children: React.ReactNode
  onClick: () => void
}) => (
  // eslint-disable-next-line react/button-has-type
  <button
    className="block rounded bg-[var(--button-bg)] px-2 py-0 text-[var(--button-text)] hover:bg-[var(--button-bg-hover)] hover:text-[var(--button-text-hover)]"
    {...props}
  />
)
