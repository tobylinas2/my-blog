export function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ink-faint">
        <p className="font-mono text-xs">
          &copy; {new Date().getFullYear()} Toby&apos;s Workshop
        </p>
        <div className="flex gap-5 font-mono text-xs">
          <a
            href="https://github.com/tobyprime"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://twitter.com/toby_linas"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink transition-colors"
          >
            Twitter
          </a>
        </div>
      </div>
    </footer>
  );
}
