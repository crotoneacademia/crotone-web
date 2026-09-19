import type { Config } from "@docusaurus/types";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const config: Config = {
  title: "Crotone Academia",
  tagline: "EXPLORE • QUESTION • UNDERSTAND",
  url: process.env.SITE_URL || "https://crotone.academy",
  baseUrl: process.env.SITE_BASE_URL || "/",
  trailingSlash: false,
  organizationName: "crotoneacademia",
  projectName: "crotone-web",
  favicon: "img/brand/crotone-logo.png",
  onBrokenLinks: "throw",
  presets: [
    [
      "classic",
      {
        docs: false,
        blog: false,
        pages: { remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] },
        theme: {
          customCss: [
            "./src/css/custom.css",
            require.resolve("katex/dist/katex.min.css"),
          ],
        },
        sitemap: { changefreq: "monthly", priority: 0.5 },
      },
    ],
  ],
  themeConfig: {
    image: "img/brand/social-preview.png",
    metadata: [
      {
        name: "description",
        content:
          "Crotone Academia is an independent initiative for learning, research and exploration across artificial intelligence, science and emerging technology.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    colorMode: {
      defaultMode: "light",
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    prism: { additionalLanguages: ["python", "bash"] },
  },
};
export default config;
