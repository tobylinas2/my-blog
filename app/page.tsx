import Image from "next/image";
import Link from "next/link";
import { GithubIcon, TwitterIcon } from "@/components/SocialIcons";

const projects = [
  {
    name: "Mcedia",
    tagline: "在 Minecraft 里看视频",
    description:
      "在 Minecraft 世界中播放 B 站视频、直播和抖音片段，用盔甲架当电视。支持弹幕、空间音频和智能性能调度。",
    image: "/images/mcedia-watercolor.png",
    modrinth: "https://modrinth.com/mod/mcedia",
    downloads: "27K+",
    tags: ["Fabric", "客户端"],
  },
  {
    name: "Toby's Camera",
    tagline: "把 Minecraft 拍成照片",
    description:
      "手持相机，对准你想留住的画面。成片是原版地图物品，不需要 Mod 的玩家也能查看、交易和挂进展示框。",
    image: "/images/tobys-camera-watercolor.png",
    modrinth: "https://modrinth.com/mod/tobys-camera",
    downloads: "235+",
    tags: ["Fabric", "Paper/Folia"],
  },
];

const socialLinks = [
  { name: "GitHub", icon: GithubIcon, href: "https://github.com/tobyprime" },
  { name: "Twitter", icon: TwitterIcon, href: "https://twitter.com/toby_linas" },
];

export default function Home() {
  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="space-y-6 pt-8">
        <div className="space-y-2">
          <p className="text-sm tracking-widest uppercase text-ink-faint font-mono">
            Independent Developer
          </p>
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Toby&apos;s Workshop
          </h1>
        </div>
        <p className="text-lg text-ink-light leading-relaxed max-w-xl">
          做 Minecraft Mod，写代码，偶尔折腾点别的东西。
        </p>

        {/* Social Links */}
        <div className="flex gap-4 pt-2">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-ink-faint hover:text-ink transition-colors group"
            >
              <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>{link.name}</span>
            </a>
          ))}
          <span className="text-ink-faint">/</span>
          <Link href="/blog" className="flex items-center gap-2 text-sm text-ink-faint hover:text-ink transition-colors">
            <span>Blog</span>
          </Link>
          <Link href="/about" className="flex items-center gap-2 text-sm text-ink-faint hover:text-ink transition-colors">
            <span>About</span>
          </Link>
        </div>
      </section>

      {/* Divider */}
      <hr className="border-border" />

      {/* Projects */}
      <section className="space-y-16">
        <h2 className="text-2xl font-bold">Featured Works</h2>
        <div className="space-y-20">
          {projects.map((project) => (
            <article key={project.name} className="group">
              {/* Watercolor image - no border, soft edges */}
              <div className="relative -mx-6 md:mx-0 overflow-visible">
                <div className="relative aspect-[4/3] md:aspect-[16/9]">
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-contain mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ filter: "saturate(0.85)" }}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">{project.name}</h3>
                  <span className="text-xs font-mono text-ink-faint bg-paper-dark px-2 py-0.5 rounded">
                    {project.downloads} downloads
                  </span>
                </div>
                <p className="text-ink-light italic">{project.tagline}</p>
                <p className="text-ink-light leading-relaxed text-[15px]">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-mono px-2 py-0.5 border border-border rounded text-ink-faint"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="pt-2">
                  <a
                    href={project.modrinth}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:text-ink transition-colors font-mono"
                  >
                    View on Modrinth &rarr;
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Divider */}
      <hr className="border-border" />

      {/* Writing */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Writing</h2>
        <p className="text-ink-light">
          还没开始写，但总会写的。
        </p>
        <Link
          href="/blog"
          className="inline-block text-sm text-accent hover:text-ink transition-colors font-mono"
        >
          View all posts &rarr;
        </Link>
      </section>
    </div>
  );
}
