import { GithubIcon, TwitterIcon } from "./SocialIcons";

export function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ink-faint">
        <p className="font-mono text-xs">
          &copy; {new Date().getFullYear()} Toby&apos;s Workshop
        </p>
        <div className="flex gap-5">
          <a
            href="https://github.com/tobyprime"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-ink transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span className="font-mono text-xs">GitHub</span>
          </a>
          <a
            href="https://twitter.com/toby_linas"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-ink transition-colors"
          >
            <TwitterIcon className="w-3.5 h-3.5" />
            <span className="font-mono text-xs">Twitter</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
