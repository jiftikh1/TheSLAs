# Milestone 2: Core Data Models & Software Catalog ✅

## Completed Implementation

### Database Schema Extensions

#### Software Model
Complete software catalog with:
- Unique name and slug for URL-friendly routing
- Description and category
- Website URL and logo support
- Timestamps for tracking

#### Post Model
Practitioner insights with:
- Link to software and author (User)
- **Dimension** enum: PARTNERSHIPS, INTEGRATIONS, WORKFLOWS, ISSUES
- Content field for the post body
- **Trust scoring fields**:
  - `trustScore` (0-100): Displayed as Low/Medium/High confidence
  - `signalQuality` (0-100): Internal metric for content quality
- **Slop detection fields**:
  - `slopRisk` (0-100): AI slop likelihood
  - `hasAnchors`: Time-in-system indicators present
- **Moderation fields**:
  - `flaggedForPricing`: Auto-detected pricing language
  - `moderationStatus`: published/flagged/removed
- Indexes for efficient querying

#### Validation Model
Peer validation system with:
- Link to post and user
- **ValidationType** enum: HELPFUL, MATCHES_EXPERIENCE, LEARNED_SOMETHING
- Unique constraint: one validation type per user per post
- Indexes for efficient queries

#### User Model Extensions
Added reputation system fields:
- `reputationScore` (Float): Internal trust metric
- `reputationTier` (String): emerging/trusted/experienced/system-level
- `lastActiveAt` (DateTime): For reputation decay

### Seed Data

**10 Popular Software Platforms:**
1. **Salesforce** - CRM
2. **HubSpot** - CRM
3. **Slack** - Communication
4. **Jira** - Project Management
5. **Tableau** - Analytics
6. **Zendesk** - Customer Support
7. **Workday** - HR & Finance
8. **ServiceNow** - IT Service Management
9. **Marketo** - Marketing
10. **Datadog** - DevOps

Each entry includes:
- Name and slug
- Description
- Category
- Website URL

### Library Functions

**`lib/software.ts` - Software Query Utilities:**
- `getAllSoftware()` - Get all software alphabetically
- `getSoftwareBySlug(slug)` - Get software with posts and author info
- `getSoftwareWithStats(slug)` - Get software with dimension counts and avg trust
- `searchSoftware(query)` - Search by name/category/description
- `getSoftwareByCategory()` - Group software by category

### UI Components

**Software Catalog Page (`/software`):**
- Lists all software grouped by category
- Clean card-based design
- Links to individual software pages
- Responsive grid layout

**Updated Feed Page (`/feed`):**
- Displays user profile information
- Link to browse software catalog
- Milestone 2 completion banner

## Files Created

```
lib/
└── software.ts                      # Software query utilities

app/
└── software/
    └── page.tsx                     # Software catalog listing

prisma/
├── seed.ts                          # Database seed script
└── migrations/
    └── 20260202045121_add_software_posts_validations/
        └── migration.sql            # Database migration
```

## Files Updated

```
prisma/
├── schema.prisma                    # Added Software, Post, Validation models
└── config.ts                        # Added seed command

app/feed/page.tsx                    # Added software catalog link

package.json                         # Added tsx for seed script
```

## Database Schema Diagram

```
User (from Milestone 1)
├── posts: Post[]
├── validations: Validation[]
├── reputationScore: Float
├── reputationTier: String
└── lastActiveAt: DateTime

Software
├── id: String
├── name: String (unique)
├── slug: String (unique)
├── description: String?
├── category: String
├── website: String?
└── posts: Post[]

Post
├── id: String
├── softwareId: String → Software
├── authorId: String → User
├── dimension: Dimension (enum)
├── content: String
├── trustScore: Float
├── signalQuality: Float
├── slopRisk: Float
├── hasAnchors: Boolean
├── flaggedForPricing: Boolean
├── moderationStatus: String
└── validations: Validation[]

Validation
├── id: String
├── postId: String → Post
├── userId: String → User
└── type: ValidationType (enum)

Enums:
- Dimension: PARTNERSHIPS, INTEGRATIONS, WORKFLOWS, ISSUES
- ValidationType: HELPFUL, MATCHES_EXPERIENCE, LEARNED_SOMETHING
```

## Testing the Implementation

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Browse the Software Catalog
Visit: http://localhost:3000/software

You should see:
- 10 software entries grouped by category
- Categories: CRM, Communication, Project Management, Analytics, etc.
- Each software card shows name, description, and category
- Cards are clickable (links to detail pages - coming in Milestone 3)

### 3. Verify Database
```bash
npx prisma studio
```

This opens a GUI where you can:
- Browse all software entries
- See the schema structure
- Verify relationships

### 4. Test Queries
The software utilities can be imported and used in any server component:

```typescript
import { getAllSoftware, getSoftwareBySlug } from "@/lib/software";

// Get all software
const software = await getAllSoftware();

// Get specific software with posts
const salesforce = await getSoftwareBySlug("salesforce");
```

## Acceptance Criteria Status

- ✅ Database schema deployed with Software, Post, Validation models
- ✅ Dimension enum (PARTNERSHIPS, INTEGRATIONS, WORKFLOWS, ISSUES)
- ✅ ValidationType enum (HELPFUL, MATCHES_EXPERIENCE, LEARNED_SOMETHING)
- ✅ Trust scoring fields (trustScore, signalQuality)
- ✅ Slop detection fields (slopRisk, hasAnchors)
- ✅ Reputation fields on User model
- ✅ Seed script creates 10 software entries
- ✅ Prisma client accessible throughout app
- ✅ Software query utilities created
- ✅ Software catalog page implemented
- ✅ No TypeScript errors
- ✅ Migration applied successfully

## Data Model Highlights

### Multi-Dimensional Evaluation
Posts are tagged with one of four dimensions:
- **PARTNERSHIPS**: Vendor relationship quality, responsiveness, roadmap trust
- **INTEGRATIONS**: Depth vs surface-level, reliability, maintenance
- **WORKFLOWS**: What it's great at, where it becomes painful, scale issues
- **ISSUES**: Known landmimes, late discovery gotchas, warnings

### Trust & Reputation System (Backend Ready)
The schema is prepared for:
- Post-level trust scoring (what readers see)
- User-level reputation (internal, affects post weighting)
- Slop detection and quality signals
- Peer validation tracking

### Anonymous But Accountable
Posts link to users but display only:
- Role (e.g., "Senior Systems Engineer")
- Seniority level
- Industry context
- Company size

No names or identifying information shown to other users.

## Next Steps

Ready to proceed to **Milestone 3: Software Profile Pages (Read-Only)**

This will include:
- Individual software detail pages at `/software/[slug]`
- Dimension tab navigation
- Display posts filtered by dimension
- Empty states for dimensions without content
- Basic UI polish
