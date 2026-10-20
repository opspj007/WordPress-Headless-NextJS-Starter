<img width="1920" height="846" alt="Screenshot (377)" src="https://github.com/user-attachments/assets/9b43c8ab-10cf-4ec8-bede-1a9c780f4cf4" /># WordPress-Headless-NextJS-Starter
[Uploading Screenshot (377).png…]()


**An Enterprise-Grade Headless WordPress + Next.js 15 Architecture Lab**

A production-oriented reference implementation demonstrating how to architect, secure, optimize, and operate a decoupled WordPress CMS with Next.js 15, React Server Components, ISR, WPGraphQL, REST APIs, and edge caching.

This project combines an interactive architecture simulator with a structured starter codebase, demonstrating the engineering decisions behind modern headless content platforms: cache invalidation, preview security, dynamic routing, structured content, SEO, image optimization, and API performance.

> **Project philosophy:** Treat WordPress as a content platform, Next.js as the rendering and delivery layer, and the CDN as a strategic performance boundary. Keep the system observable, secure by default, and maintainable under production workloads.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Core Capabilities](#core-capabilities)
- [1. Next.js 15 Frontend](#1-nextjs-15-frontend)
- [2. WordPress Core and Headless API Hub](#2-wordpress-core-and-headless-api-hub)
- [3. ISR and Edge Cache Studio](#3-isr-and-edge-cache-studio)
- [4. Enterprise SEO and Structured Data](#4-enterprise-seo-and-structured-data)
- [5. Production Starter Codebase](#5-production-starter-codebase)
- [6. Interactive Enterprise Topology](#6-interactive-decoupled-enterprise-topology)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Security Architecture](#security-architecture)
- [Production Engineering Decisions](#production-engineering-decisions)
- [Testing and Quality](#testing-and-quality)
- [Deployment Architecture](#deployment-architecture)
- [Roadmap](#roadmap)
- [License](#license)

---

## Architecture Overview

The platform separates content authoring, content delivery, rendering, and edge caching into independently managed layers.

```text
┌───────────────────────────────────────────────────────┐
│                  WORDPRESS CMS                        │
│                                                       │
│ Posts · Custom Post Types · Gutenberg · ACF Pro       │
│ Media Library · Taxonomies · Editorial Workflows      │
└────────────────────────┬──────────────────────────────┘
                         │
              REST API / WPGraphQL
                         │
                         ▼
┌───────────────────────────────────────────────────────┐
│               NEXT.JS DATA ACCESS LAYER               │
│                                                       │
│ Typed API Clients · Validation · Authentication       │
│ Request Deduplication · Cache Tags · Error Handling   │
└────────────────────────┬──────────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────────┐
│                NEXT.JS 15 APP ROUTER                  │
│                                                       │
│ React Server Components · Dynamic Routes · ISR        │
│ Draft Mode · Metadata · Sitemap · Route Handlers      │
└────────────────────────┬──────────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────────┐
│                  EDGE / CDN LAYER                     │
│                                                       │
│ CDN Cache · Revalidation · Stale Content Strategy     │
│ Request Filtering · Geographic Distribution           │
└────────────────────────┬──────────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────────┐
│                    REACT UI                           │
│                                                       │
│ Responsive Components · Optimized Images · A11y       │
│ SEO Metadata · Core Web Vitals · Content Rendering    │
└───────────────────────────────────────────────────────┘
```

### Architectural principles

- **Decoupled delivery:** WordPress does not need to render the public-facing website.
- **Server-first rendering:** Fetch and transform content on the server wherever possible.
- **Explicit cache ownership:** Define cache tags, expiration policies, and invalidation boundaries.
- **Secure editorial previews:** Separate authenticated preview access from publicly cached content.
- **Typed integration boundaries:** Validate external data before passing it to application components.
- **Operational observability:** Make API latency, cache behavior, webhook outcomes, and errors inspectable.
- **Progressive scalability:** Scale the CMS, rendering layer, and delivery infrastructure independently.

---

## Core Capabilities

| Domain | Capabilities |
|---|---|
| Frontend | Next.js App Router, dynamic routes, Server Components |
| Content | WordPress posts, custom post types, Gutenberg, ACF Pro |
| APIs | WordPress REST API, WPGraphQL, typed clients |
| Preview | Draft Mode, protected preview routes, authenticated content fetching |
| Performance | ISR, tagged caching, on-demand invalidation, optimized images |
| SEO | Metadata, canonical URLs, XML sitemap, JSON-LD |
| Security | Secret validation, HTTP-only cookies, origin restrictions |
| Observability | Request metrics, cache statistics, webhook audit trail |
| Infrastructure | Docker Compose, database isolation, CDN integration |
| Quality | TypeScript, automated tests, linting, accessibility checks |

The interactive studio simulates the behavior of the underlying architecture. Actual WordPress requests, cryptographic validation, cache purges, and deployment behavior are performed only where the corresponding backend integration is implemented and configured.

---

## 1. Next.js 15 Frontend

The frontend demonstrates how a modern Next.js application can consume structured WordPress content while preserving routing, rendering, caching, and SEO boundaries.

### Dynamic Route Engine

Route families model content-driven URLs:

```text
/blog/[slug]
/case-studies/[slug]
/portfolio/[slug]
/docs/[slug]
```

Features include:

- Static parameter generation with `generateStaticParams()`.
- Dynamic content resolution by slug.
- Route-specific metadata with `generateMetadata()`.
- Explicit handling of missing content with `notFound()`.
- Static generation for known content and request-time resolution for other routes.
- Simulated browser navigation displaying the active path and HTTP status.
- Cache-state indicators for HIT, STALE, and MISS.

**Engineering note:** In Next.js 15, dynamic routes and fallback behavior depend on the route configuration, rendering mode, and deployment platform. `generateStaticParams()` alone does not implement every fallback or cache policy.

### Draft Mode and Editorial Preview

A toggleable preview interface demonstrates the distinction between published content and unpublished revisions.

The preview flow supports:

1. An editor initiates a protected preview URL.
2. The server validates the preview request.
3. Next.js enables Draft Mode.
4. The server retrieves draft content through an authenticated WordPress API request.
5. The frontend renders the preview without exposing privileged credentials.
6. The editor exits preview mode to return to the published website.

The interface can display the `__prerender_bypass` cookie state and the currently selected preview content.

**Security boundary:** Draft Mode is not an authentication system. Protect preview initiation with a high-entropy secret or an authenticated editorial workflow, validate requested slugs, use HTTPS, and prevent draft responses from entering public caches.

### Image Optimization Simulator

The image studio illustrates the performance implications of responsive image delivery.

- WebP and AVIF format selection.
- Intrinsic dimensions and responsive image sizing.
- Estimated payload savings relative to an original asset.
- Blur placeholders and loading behavior.
- Remote WordPress image configuration.
- Fallback handling for unsupported formats.

The displayed bandwidth reduction, such as `-76%`, is an illustrative measurement unless it is calculated from actual source and transformed asset sizes.

### Gutenberg HTML Content Renderer

The content renderer demonstrates the presentation of WordPress Gutenberg output, including:

- Semantic headings and paragraphs.
- Blockquotes and lists.
- Inline links and emphasis.
- Images and captions.
- Syntax-highlighted code blocks.
- Consistent typography and spacing.

Content should be sanitized or restricted to trusted, validated markup before rendering. Avoid blindly inserting arbitrary HTML into the React tree.

### ACF Pro Callouts

Structured fields demonstrate how editorial metadata can be rendered independently of the main article body.

Example fields include:

- Client name.
- Project budget.
- Deployment target.
- Key performance metrics.
- Project duration.
- Technologies used.

The frontend consumes typed field models rather than scattering WordPress-specific field access throughout presentation components.

### Search and Filter Pipeline

An interactive content browser supports:

- Instant client-side search.
- Search across titles, excerpts, tags, and authors.
- Content-type tabs.
- Filtering across posts, case studies, portfolio entries, and documentation.
- Empty states and responsive result lists.

For larger content libraries, the same interface can be extended to server-side search, pagination, and indexed search services.

---

## 2. WordPress Core and Headless API Hub

This module provides an inspection surface for WordPress content models, REST endpoints, GraphQL queries, and authentication configuration.

### WPGraphQL Playground

An interactive GraphiQL-style interface demonstrates the query lifecycle with editable GraphQL documents and JSON variables.

Preset operations include:

- `GetPostsWithAuthorAndSEO`
- `GetCaseStudiesWithACF`
- `GetDraftPostForPreview`

The performance panel displays:

- Query execution duration.
- MySQL query count.
- Response size.
- Query success or failure.
- A formatted JSON response with copy support.

DataLoader-style batching and request-level deduplication help avoid N+1 access patterns, but the actual database query count must be measured by the WordPress integration. The interface must not imply that query optimization has occurred merely because a preset is selected.

### REST API Explorer

The explorer supports configurable endpoints such as:

```text
/wp-json/wp/v2/posts
/wp-json/wp/v2/case_studies
/wp-json/wp/v2/portfolio
/wp-json/wp/v2/users
/wp-json/wp/v2/settings
```

Query parameters can be inspected and modified:

```text
/wp-json/wp/v2/posts?_embed=true&per_page=5
```

The response inspector exposes:

- HTTP status.
- Response body.
- `X-WP-Total`.
- `X-WP-TotalPages`.
- `Cache-Control`, when supplied by the server.
- `X-Content-Type-Options`, when supplied by the server.

Headers vary according to the WordPress configuration, authentication state, plugins, and intermediary caches. The explorer should show actual received headers rather than fabricate missing ones.

### Custom Post Types Manager

The registry models the following content types:

| Content type | Purpose |
|---|---|
| `post` | Articles and editorial content |
| `case_study` | Client projects and outcomes |
| `portfolio` | Selected work and project showcases |
| `doc` | Technical documentation |

The interface includes content status, registered fields, REST availability, and publishing controls.

A connected implementation can support content creation, publishing, status transitions, and revalidation triggers through authenticated WordPress operations.

**Production requirement:** Publishing controls must use WordPress authorization and capability checks. Never permit an anonymous browser session to publish content simply because the interface offers a publish button.

### Authentication and JWT Security Engine

The security module demonstrates:

- Bearer token structure and decoding.
- HMAC-SHA256 signature verification.
- WordPress Application Passwords.
- Trusted frontend origin configuration.
- `WP_REVALIDATE_SECRET`.
- `WP_PREVIEW_SECRET`.

JWT decoding is not equivalent to signature verification. A production verifier must validate the algorithm, signature, issuer, audience where applicable, expiration, and other required claims.

WordPress core Application Passwords are not a general-purpose JWT issuance system. JWT integration requires an appropriate plugin or authentication service.

Secrets must remain server-side, must never be included in client bundles, and should not be written to application logs or copied into public diagnostic output.

---

## 3. ISR and Edge Cache Studio

The cache studio visualizes the relationship between WordPress content mutations, webhook delivery, Next.js invalidation, and regenerated responses.

### Stale-While-Revalidate Lifecycle

```text
WordPress Editor
      │
      ▼
save_post Hook
      │
      ▼
Authenticated Webhook
      │
      ▼
Next.js Revalidation Route
      │
      ▼
Validate Secret + Payload
      │
      ▼
Invalidate Relevant Cache Tags
      │
      ▼
Serve or Regenerate Fresh Content
```

The event chain is designed to replace aggressive polling with targeted invalidation.

The studio presents four stages:

1. **Content mutation:** WordPress saves or publishes content.
2. **Webhook dispatch:** The CMS sends a signed or secret-authenticated request.
3. **Cache invalidation:** The Next.js route validates the request and revalidates the affected tags or paths.
4. **Content refresh:** Subsequent requests receive content according to the configured cache and rendering strategy.

The exact stale-serving behavior depends on the cache layer and the selected Next.js APIs. `revalidateTag()` is not, by itself, a guarantee that every deployment will immediately serve stale HTML while regenerating it.

### Recharts Data Visualization Suite

The analytics dashboard includes:

- Per-tag cache hit and miss comparisons.
- A global hit-ratio donut chart.
- Total request counts.
- Cache hit ratio.
- Edge-hit latency indicators.
- Cache miss and revalidation counts.

Illustrative metrics may use emerald (`#10b981`) for hits and amber (`#f59e0b`) for misses.

Example cache tags:

```text
posts
case-studies
portfolio
docs
sitemap
```

Metrics should be clearly labeled as simulated or measured. A production deployment can populate them from actual application telemetry, CDN logs, and revalidation events.

### Active Cache Tags Registry

Each registered tag can display:

- Configured TTL.
- Remaining time before expiration.
- A visual expiration progress bar.
- Current cache status.
- Per-tag hit-rate statistics.
- Manual revalidation controls.

The studio can use a one-second UI ticker to update countdown displays. These timers represent the configured simulation or known expiration schedule; they should not be treated as proof of the actual CDN's expiration state.

### Webhook Dispatch Simulator

The simulator supports building representative payloads with:

- Target cache tag.
- Content slug.
- Authorization secret.
- Content mutation event.

Quick actions:

- **Valid `save_post`:** Simulates a valid content update.
- **Test 401 Intrusion:** Simulates an invalid authorization token.

A real dispatch must call the configured endpoint and display the server's actual response. Local simulation should be labeled separately.

### Webhook Audit Trail

The chronological event feed records:

- `200 OK` — request accepted and invalidation completed.
- `401 Unauthorized` — authentication failed.
- `400 Bad Request` — payload validation failed.

The payload inspector can expose request headers, a formatted JSON body, token-validation results, and the revalidation report.

Do not store raw secrets in the audit trail. Record a redacted authorization result and a request correlation ID instead.

---

## 4. Enterprise SEO and Structured Data

The SEO suite demonstrates how content metadata flows from WordPress into search engines, social previews, and structured data consumers.

### Dynamic XML Sitemap

The sitemap generator models the Next.js `app/sitemap.ts` convention and produces XML compatible with the Sitemaps protocol.

Supported content types include:

- Published posts.
- Case studies.
- Portfolio pages.
- Documentation pages.

Each entry can include:

- Canonical URL.
- `lastModified`.
- Priority.
- Change frequency.

Illustrative priorities:

| Content type | Example priority | Example frequency |
|---|---:|---|
| Homepage | 1.0 | Daily |
| Core landing pages | 0.9 | Weekly |
| Articles and case studies | 0.8 | Weekly |

Priority and change frequency are advisory metadata, not ranking guarantees. The sitemap should include only eligible, canonical, publicly accessible URLs and must handle pagination and the sitemap size limits.

Features include XML preview, copy-to-clipboard, and a downloadable `sitemap.xml` artifact.

### Google Search SERP Simulator

A search-result preview displays:

- Canonical URL.
- Page title.
- Meta description.
- Publication date.
- Content type.

This helps developers and editors review metadata before publishing. Actual Google snippets remain subject to Google's indexing and presentation decisions.

### Open Graph and Twitter / X Cards

Preview cards demonstrate metadata for Facebook, LinkedIn, Slack, and Twitter / X.

Supported properties include:

```text
og:title
og:description
og:image
og:type
twitter:card
twitter:title
twitter:description
twitter:image
```

The implementation should generate absolute URLs and use publicly accessible image assets with suitable dimensions.

### Schema.org JSON-LD Inspector

The inspector generates structured data examples for:

- `Article`
- `TechArticle`
- `CreativeWork` or an appropriately modeled case study.

The generated JSON-LD includes relevant properties such as headline, publication dates, author, publisher, and canonical URL.

JSON-LD should accurately reflect visible page content. Schema validity does not guarantee rich-result eligibility, and a case study should not be assigned an unsupported schema type simply for convenience.

---

## 5. Production Starter Codebase

The repository includes a reference implementation organized around explicit data-access, routing, security, and presentation boundaries.

### Repository Layout

```text
WordPress-Headless-NextJS-Starter/
├── app/
│   ├── blog/
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── api/
│   │   ├── revalidate/
│   │   │   └── route.ts
│   │   └── draft/
│   │       └── route.ts
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── WpImage.tsx
│   └── content/
├── lib/
│   └── wordpress.ts
├── wordpress/
│   └── wp-content/
│       └── plugins/
│           └── headless-starter/
│               └── headless-starter.php
├── tests/
├── docker-compose.yml
├── next.config.ts
├── package.json
└── .env.example
```

### `lib/wordpress.ts`

The WordPress client centralizes API access and provides:

- REST and GraphQL transport.
- Typed response contracts.
- Runtime response validation.
- Cache tags and revalidation policies.
- Request timeouts and predictable error handling.
- Separation between public content access and authenticated preview access.

Representative cache configuration:

```ts
fetch(url, {
  next: {
    tags: ["posts"],
    revalidate: 300,
  },
});
```

The exact options must match the selected Next.js 15 version and deployment configuration.

### `app/blog/[slug]/page.tsx`

The dynamic page demonstrates:

- Static parameter generation.
- Server-side content retrieval.
- Route metadata.
- Draft-aware rendering.
- Missing-content handling.
- Responsive image delivery.

The page remains a server component unless a client-side interaction specifically requires browser state.

### `app/api/revalidate/route.ts`

The webhook route demonstrates:

- Server-only secret access.
- Request authentication.
- Input schema validation.
- Explicit tag allowlisting.
- Targeted cache invalidation.
- Structured responses and safe audit logging.

A production handler should authenticate the webhook, validate the payload before acting, and invalidate only the content associated with the event. For deployments requiring stronger replay protection, add timestamp validation, signed payloads, or an idempotency mechanism.

### `app/api/draft/route.ts`

The draft route demonstrates:

- Preview request validation.
- Slug validation.
- Draft Mode activation.
- Secure redirect handling.
- HTTP-only preview-cookie behavior.
- Separation of preview credentials from public frontend code.

Use a controlled redirect target and avoid accepting arbitrary external redirect URLs.

### `app/sitemap.ts`

The sitemap implementation demonstrates server-side content discovery, canonical URL generation, and publication-aware filtering.

For large websites, paginate API requests and account for sitemap index generation and the protocol's URL-count and file-size limits.

### `components/WpImage.tsx`

The image wrapper centralizes WordPress image rendering using `next/image`.

It supports:

- Responsive dimensions.
- Remote image allowlisting.
- Placeholder configuration.
- Accessible alternative text.
- Browser-supported image formats.

Next.js image optimization and format negotiation should be configured through `next.config.ts` and the image optimizer. An application-level wrapper does not itself convert an image to AVIF or guarantee a particular bandwidth saving.

### `docker-compose.yml`

The local development stack can orchestrate:

- WordPress.
- MySQL 8.
- Next.js.
- Persistent database storage.
- Environment-driven configuration.

Pin service image versions, use persistent volumes, avoid committing credentials, and keep the database inaccessible from public networks.

### Starter Package Export

The architecture lab can expose a bundled JSON artifact containing the selected reference files.

The exported package should be versioned, reproducible, and explicit about whether it contains illustrative examples or runnable production integrations. Secrets, runtime environment files, and database credentials must never be included.

---

## 6. Interactive Decoupled Enterprise Topology

The architecture explorer models the system as five inspectable layers.

### Layer 1 — WordPress Core

**Responsibilities**

- Content authoring and editorial workflows.
- Custom post types and taxonomies.
- Gutenberg and ACF field management.
- Database persistence and media management.

**Security and scalability**

- Apply WordPress capabilities and least-privilege access.
- Keep the database on a private network.
- Use a managed hosting or appropriately secured container environment.
- Separate editorial access from public content delivery.

### Layer 2 — REST API / WPGraphQL

**Responsibilities**

- Structured content delivery.
- Query filtering and pagination.
- Authentication and authorization.
- Content mutation webhooks.

**Security and scalability**

- Restrict privileged operations.
- Validate request inputs.
- Limit query complexity where supported.
- Avoid unnecessary field retrieval and N+1 query patterns.
- Use appropriate rate limits and timeouts.

### Layer 3 — Next.js App Router

**Responsibilities**

- React Server Components.
- Static and dynamic rendering.
- Route-level metadata.
- Draft previews and cache invalidation.
- Content transformation and error handling.

**Security and scalability**

- Keep privileged tokens server-side.
- Separate preview responses from public cache entries.
- Centralize cache policy.
- Use explicit invalidation boundaries.
- Measure rendering latency and external API latency independently.

### Layer 4 — Edge CDN

**Responsibilities**

- Distribute static assets and eligible responses.
- Reduce latency for geographically distributed visitors.
- Apply cache policies and request filtering.
- Support platform-specific revalidation workflows.

**Security and scalability**

- Avoid caching authenticated or personalized content publicly.
- Configure cache keys and bypass rules deliberately.
- Protect origin services.
- Monitor cache hit ratios, response age, and origin traffic.

Cloudflare Workers, Cloudflare's CDN, and Vercel's delivery infrastructure offer different execution and caching semantics; they should be integrated according to the deployment target rather than treated as interchangeable implementations.

### Layer 5 — React UI

**Responsibilities**

- Accessible content presentation.
- Responsive design.
- Image delivery.
- Interactive filtering and navigation.
- Core Web Vitals optimization.

**Security and scalability**

- Minimize client-side JavaScript.
- Prefer semantic HTML and server-rendered content.
- Sanitize untrusted content.
- Provide loading, error, and empty states.
- Validate accessibility and performance with automated tests.

The topology explorer lets users select a layer to inspect its responsibilities, security controls, data flow, and high-traffic scaling considerations.

---

## Technology Stack

| Technology | Role |
|---|---|
| WordPress 6.7+ | Headless CMS reference baseline |
| Next.js 15 | App Router and rendering |
| React | Component-based UI |
| TypeScript | Static typing and maintainability |
| WordPress REST API | Content transport |
| WPGraphQL | Optional GraphQL integration |
| ACF Pro | Structured editorial metadata |
| MySQL 8 | Local CMS database |
| Docker Compose | Local orchestration |
| Recharts | Analytics visualizations |
| Zod or equivalent | Runtime data validation |
| Vitest / Jest | Unit testing |
| Playwright | Browser-level testing |

Pin the exact dependency versions in the lockfile. The listed versions establish a reference baseline, not a guarantee that every newer WordPress, Next.js, or plugin version will be compatible without testing.

---

## Getting Started

### Prerequisites

- Node.js version supported by your chosen Next.js 15 release.
- npm, pnpm, or another configured package manager.
- Docker and Docker Compose.
- A WordPress installation with REST API access.
- Optional WPGraphQL and ACF Pro installations.

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/WordPress-Headless-NextJS-Starter.git

cd WordPress-Headless-NextJS-Starter
```

Replace `YOUR_USERNAME` with the repository owner's GitHub username.

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Populate the values for your WordPress instance and preview/revalidation secrets. Never commit `.env.local`.

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development environment

If the repository's Compose configuration is complete:

```bash
docker compose up -d
```

Start the frontend in a separate terminal:

```bash
npm run dev
```

### 5. Open the application

```text
Frontend:   http://localhost:3000
WordPress:  http://localhost:8080
```

The WordPress address depends on the ports configured in `docker-compose.yml`.

### 6. Validate the installation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

These commands should be defined in `package.json` before they are treated as supported project scripts. Configure WordPress custom post types, API plugins, and webhook endpoints before testing the full integration.

---

## Environment Configuration

Example `.env.example`:

```dotenv
# Public content API base URL
WORDPRESS_API_URL=http://localhost:8080

# Optional GraphQL endpoint
WORDPRESS_GRAPHQL_URL=http://localhost:8080/graphql

# Absolute public frontend origin
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Server-side preview and revalidation secrets
WP_PREVIEW_SECRET=replace-with-a-long-random-secret
WP_REVALIDATE_SECRET=replace-with-a-different-random-secret

# Optional authenticated WordPress integration
WP_API_USERNAME=
WP_API_APPLICATION_PASSWORD=
```

Use separate credentials for preview and revalidation. In production, use a secrets manager or the deployment platform's protected environment configuration.

Do not prefix privileged credentials with `NEXT_PUBLIC_`. Variables using that prefix are exposed to client-side application code.

---

## Security Architecture

Security is enforced at the server and infrastructure boundaries, not merely represented in the dashboard.

### Authentication and authorization

- Use least-privilege WordPress accounts.
- Protect editorial and mutation endpoints.
- Validate authorization before cache invalidation.
- Keep API credentials out of browser bundles.
- Avoid using Application Passwords for public browser requests.

### Webhook validation

- Require a high-entropy secret or cryptographically signed payload.
- Validate the request body and allowed tags.
- Consider replay protection and idempotency.
- Rate-limit exposed endpoints where appropriate.
- Redact credentials from logs.
- Return accurate HTTP status codes.

### Draft preview

- Require a protected preview initiation flow.
- Use secure cookie settings over HTTPS in production.
- Validate slugs and redirect destinations.
- Fetch draft content through authenticated server-side requests.
- Prevent draft content from entering public caches or sitemaps.

### Network boundaries

- Keep the database private.
- Restrict WordPress administrative access.
- Allow only required cross-origin requests.
- Use origin restrictions and appropriate security headers.
- Protect the origin behind the intended CDN or hosting network where supported.

CORS controls browser cross-origin access; it does not replace authentication, authorization, or server-side access controls.

---

## Production Engineering Decisions

### On-demand invalidation versus polling

Polling introduces repeated requests, unnecessary origin load, and a delay between content publication and frontend updates.

Event-driven invalidation allows WordPress to notify Next.js when relevant content changes. This reduces unnecessary work and provides a more direct path to content freshness.

The trade-off is additional webhook security, delivery reliability, retries, and observability requirements. Production systems should consider durable delivery, idempotent handling, retry policies, and reconciliation for missed events.

### Protecting the origin

A private database, restricted administrative endpoints, least-privilege service accounts, and appropriate CDN-to-origin controls reduce the exposed attack surface.

VPC isolation is applicable when supported by the hosting architecture. It should not be presented as a universal requirement for every managed WordPress or serverless deployment.

### Offloading image transformation

Image optimization should use a managed image CDN or the configured Next.js image optimization infrastructure when appropriate. This can reduce application-server work and improve delivery performance.

The decision depends on transformation costs, cache behavior, image formats, origin bandwidth, and hosting constraints.

### Cache invalidation strategy

Cache tags should reflect content dependencies.

For example, updating an author may affect multiple posts, while changing a portfolio item may affect its detail page, portfolio listing, and sitemap.

A production invalidation model should represent these relationships explicitly rather than indiscriminately purging every cache entry.

### Observability and performance budgets

Measure the following independently:

- WordPress API latency.
- GraphQL execution time.
- Database query count.
- Next.js rendering time.
- CDN cache hit ratio.
- Webhook delivery success rate.
- Revalidation duration.
- Core Web Vitals.

Simulated dashboard values are useful for demonstrating the design, but production performance claims must be backed by measured telemetry.

---

## Testing and Quality

A senior-level implementation should verify behavior, failure paths, and security boundaries.

### Unit tests

- API response validation.
- Slug and query parameter validation.
- Cache-tag mapping.
- Metadata generation.
- Webhook authentication.
- Preview redirect validation.

### Integration tests

- WordPress REST API connectivity.
- GraphQL query behavior.
- Custom post type registration.
- Draft preview authorization.
- Webhook-to-revalidation flow.
- Sitemap generation from published content.

### End-to-end tests

- Open a published article.
- Resolve a dynamic route.
- Display a not-found state for a missing slug.
- Search and filter content.
- Reject invalid webhook credentials.
- Preview unpublished content through an authorized session.
- Verify that content changes trigger the expected invalidation behavior.

### Quality gates

- TypeScript compilation.
- ESLint.
- Unit and integration tests.
- Production build.
- Accessibility checks.
- Dependency and secret scanning.
- Performance testing against representative content volumes.

---

## Deployment Architecture

A production deployment separates CMS administration from public delivery.

```text
Editorial Team
      │
      ▼
Protected WordPress
      │
      ├── REST API / WPGraphQL
      │
      └── Authenticated Webhooks
                    │
                    ▼
             Next.js Application
                    │
                    ▼
                CDN / Edge
                    │
                    ▼
              Public Visitors
```

Recommended deployment responsibilities:

- **WordPress hosting:** CMS administration, database, media, and API.
- **Next.js hosting:** Rendering, data access, preview routes, and revalidation handlers.
- **CDN:** Public asset delivery and eligible response caching.
- **Secrets manager:** Credentials and environment configuration.
- **Monitoring:** Application errors, latency, webhook delivery, and cache metrics.
- **CI/CD:** Automated tests, production builds, deployment checks, and rollback support.

Deployment-specific configuration must be validated before enabling public traffic, particularly around image optimization, cache semantics, preview protection, and CDN invalidation.

---

## Roadmap

- [ ] Complete the Next.js 15 App Router implementation.
- [ ] Add WordPress custom post type registration.
- [ ] Integrate REST API and WPGraphQL clients.
- [ ] Implement authenticated Draft Mode previews.
- [ ] Implement webhook-based cache invalidation.
- [ ] Add dynamic metadata and sitemap generation.
- [ ] Add responsive WordPress image components.
- [ ] Connect cache analytics to real telemetry.
- [ ] Implement the interactive topology explorer.
- [ ] Add unit, integration, and end-to-end tests.
- [ ] Add CI checks and dependency scanning.
- [ ] Validate deployment-specific security and caching behavior.
- [ ] Document a reproducible production deployment.

---

## License

Choose and include an explicit license before distributing the repository. MIT is a reasonable option for an open-source starter if that matches the project's intended usage.

---

## Why This Project Matters

This project demonstrates the engineering concerns that distinguish a production-minded headless CMS implementation from a basic API integration:

- Clear boundaries between CMS, application, and delivery infrastructure.
- Reliable cache invalidation and content freshness.
- Secure draft previews and privileged API access.
- Typed, testable data-access architecture.
- SEO and structured content delivery.
- Observable performance and operational failure handling.
- Deployment-aware design and documented trade-offs.

**The goal is not simply to render WordPress content in React. It is to build a maintainable, secure, observable content platform that can evolve with the needs of a production engineering team.**
