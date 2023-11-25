export const Button = (props: {
  children: React.ReactNode;
  onClick: () => void;
}) => (
  // eslint-disable-next-line react/button-has-type
  <button
    className="px-2 py-0 rounded block bg-[var(--button-bg)] hover:bg-[var(--button-bg-hover)] text-[var(--button-text)] hover:text-[var(--button-text-hover)]"
    {...props}
  />
);
