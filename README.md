# Crotone Academia

**EXPLORE • QUESTION • UNDERSTAND**

The public website for an independent learning and research initiative, built with Docusaurus, React, TypeScript and MDX. Four pages introduce the initiative, AI Fundamentals and exploratory AI-assisted quantum–relativity research. Fully static; no accounts, database or paid services.

## Local development

Use Node.js 22 or newer.

```bash
git clone https://github.com/crotoneacademia/crotone-web.git
cd crotone-web
npm ci
npm start
```

Open http://localhost:3000. To check the production site:

```bash
npm run typecheck
npm run build
npm run serve
```

## Content and design

- `src/pages/`: the four public routes and their metadata.
- `content/ai-fundamentals/overview.mdx`: educational overview and program.
- `content/research/overview.mdx`: the single exploratory research project.
- `src/components/`: shared navigation, footer, diagrams and learning journey.
- `src/css/custom.css`: responsive editorial design and brand tokens.
- `static/img/brand/`: original logo, favicon and social preview.
- `docusaurus.config.ts`: canonical domain, SEO, static generation and math.
- `.github/workflows/deploy.yml`: production build and Pages deployment.

Edit MDX to update long-form content without changing page components. Future public MDX pages can be added to `src/pages/`, importing content from the appropriate `content/` directory. There are no unpublished routes or empty navigation sections. MDX supports fenced code blocks and KaTeX math (`$...$` inline and `$$...$$` display). Fonts and KaTeX styles are bundled locally.

The original supplied logo is preserved in `static/img/brand/crotone-logo.png` and used alongside the wordmark, as the favicon, and in the social preview. The brand red (`#B32923`) is sampled from its red forms. `BRAND_LOGO` is configured in `src/components/Site.tsx`. Public GitHub and contact links are omitted until there is material to share. Run `npm run social-preview` to regenerate the social card after changing its design.

Scientific SVGs are conceptual illustrations, not research results. Do not add unverified publications, collaborators or scientific claims.

## GitHub Pages deployment

The workflow runs on pushes to `main` and manual dispatch. In the repository settings, choose **Pages → Build and deployment → Source → GitHub Actions**. It installs the lockfile with `npm ci`, checks TypeScript, generates the static build, uploads it and deploys through the official Pages actions.

No push or deployment is required for local development. Deployment can only be verified after the workflow has run on GitHub.

## Custom domain

The site is configured for `https://crotone.academy` with `baseUrl: '/'`. `static/CNAME` is included, but an Actions deployment also requires setting **crotone.academy** explicitly under repository **Settings → Pages → Custom domain**. CNAME alone does not configure an Actions deployment.

At the DNS provider, configure apex (`@`) A records:

| Type  | Name | Value                     |
| ----- | ---- | ------------------------- |
| A     | @    | 185.199.108.153           |
| A     | @    | 185.199.109.153           |
| A     | @    | 185.199.110.153           |
| A     | @    | 185.199.111.153           |
| CNAME | www  | crotoneacademia.github.io |

Verify domain ownership in GitHub, wait for DNS/certificate provisioning, then enable **Enforce HTTPS**. No DNS changes are performed by this repository. See [GitHub custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

To deliberately host at the repository URL instead, change `url` to `https://crotoneacademia.github.io` and `baseUrl` to `/crotone-web/`, and update canonical/domain assets before deploying.

## Browser checks

```bash
npx playwright install chromium
npm run test:e2e
```

The browser suite builds and serves the production site, checks all public pages across the specified screen widths, verifies navigation and mobile menu keyboard behavior, and checks metadata and local links.

## Initial deployment address

The Pages workflow initially publishes at `https://crotoneacademia.github.io/crotone-web/`, using `SITE_URL` and `SITE_BASE_URL` build variables. The source retains custom-domain defaults for local development, but the workflow omits CNAME from the deployed output until DNS is ready. To switch to the custom domain, remove those workflow overrides and the CNAME-removal step, configure the Pages custom domain, and update DNS as documented above.
