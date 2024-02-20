export function Footer() {
  return (
    <div className="mt-auto">
      <div className="mt-20 flex justify-between gap-7 border-t pb-10 pt-10 text-muted">
        <div>&copy; 2024 Iconish</div>
        <div className="flex gap-7">
          <a
            href="https://github.com/ben-rogerson/iconish"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://github.com/ben-rogerson/iconish/issues/new"
            target="_blank"
            rel="noreferrer"
          >
            New issue/request
          </a>
        </div>
      </div>
    </div>
  )
}
