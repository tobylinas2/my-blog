export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-16">
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
        <p>&copy; {new Date().getFullYear()} MyBlog. All rights reserved.</p>
        <div className="flex gap-4">
          <a
            href="https://github.com/your-username"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            GitHub
          </a>
          <a
            href="/rss.xml"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            RSS
          </a>
        </div>
      </div>
    </footer>
  );
}
