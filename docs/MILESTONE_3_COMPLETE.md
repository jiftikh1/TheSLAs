# Milestone 3: Software Profile Pages ✅

## Completed Implementation

### Individual Software Profile Pages (`/software/[slug]`)

Server-rendered dynamic route that shows practitioner insights for a specific software product.

**Features:**
- Software header with name, category, description, website link, and total insight count
- Dimension tab navigation with per-dimension post counts
- Dimension description subtitle to orient users
- Posts sorted by trust score (desc), then recency
- Empty state for dimensions without content

### Dimension Tabs

Four tabs corresponding to the four dimensions:

| Dimension | What it covers |
|-----------|---------------|
| **Partnerships** | Vendor relationship quality, responsiveness, roadmap trust |
| **Integrations** | Depth, reliability, maintenance burden |
| **Workflows** | Strengths, pain points, scale issues |
| **Issues** | Landmines, late-discovery gotchas, warnings |

Active tab is driven by `?dimension=PARTNERSHIPS` URL search param — pages are fully shareable and server-rendered. Defaults to `PARTNERSHIPS`.

### Post Cards (`PostCard` component)

Each post displays:
- **Author context** (anonymous): seniority · role · industry · company size
- **Trust badge**: High / Medium / Low confidence (color-coded green/yellow/red)
- **Post content**
- **Peer validation counts**: "X found helpful", "X matches experience", "X learned something" (only shown if non-zero)
- **Time ago** (Today / Yesterday / Xd ago / Xmo ago / Xy ago)

Trust score thresholds:
- ≥ 67 → High confidence (green)
- ≥ 34 → Medium confidence (yellow)
- < 34 → Low confidence (red)

### Empty State

When a dimension has no published posts, shows a friendly prompt encouraging the first practitioner to contribute. Mentions the specific software and dimension by name.

## Files Created

```
app/software/[slug]/page.tsx   # Dynamic software profile page
components/PostCard.tsx         # Post display component
docs/MILESTONE_3_COMPLETE.md   # This file
```

## Acceptance Criteria Status

- ✅ Individual software pages at `/software/[slug]`
- ✅ 404 for unknown slugs (via `notFound()`)
- ✅ Dimension tab navigation (PARTNERSHIPS, INTEGRATIONS, WORKFLOWS, ISSUES)
- ✅ Post counts shown on each tab
- ✅ Posts filtered by active dimension (published only)
- ✅ Posts sorted by trust score then recency
- ✅ Anonymous author display (role, seniority, industry, company size)
- ✅ Trust score badge (Low/Medium/High)
- ✅ Peer validation counts
- ✅ Empty state for dimensions without content
- ✅ No TypeScript errors
- ✅ Production build passes

## Next Steps

Ready to proceed to **Milestone 4** — likely post submission (letting authenticated users submit insights).
