# 🧠 AddBrain CORE Dashboard - System Overview

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CAPTURE LAYER (WhatsApp)                    │
│                                                                 │
│  User sends message via WhatsApp → Meta Cloud API              │
│          ↓                                                      │
│  POST /api/webhook/whatsapp                                     │
│          ↓                                                      │
│  ✓ HMAC-SHA256 verification                                    │
│  ✓ Parse message type (text/voice/image/doc)                   │
│  ✓ Extract content                                             │
│          ↓                                                      │
│  Enrich with Claude AI:                                        │
│    - Extract 2-5 tags                                          │
│    - Identify topic                                            │
│    - Generate summary                                          │
│    - Analyze sentiment                                         │
│          ↓                                                      │
│  Save to MongoDB (Card collection)                             │
│          ↓                                                      │
│  Send WhatsApp confirmation: "✓ Captured: [summary]"           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   ORGANIZE/REVIEW LAYER (Dashboard)             │
│                                                                 │
│  Main Interface: Kanban Board                                  │
│  ┌──────┬──────┬──────┬──────┬──────┐                         │
│  │Inbox │Index │Inspect│Implement│Done │                       │
│  │  (2) │ (4)  │  (3) │   (3)   │ (3) │                       │
│  └──────┴──────┴──────┴──────┴──────┘                         │
│                                                                 │
│  Actions:                                                       │
│  • Drag & drop cards between columns                           │
│  • Click card → Detail panel                                   │
│  • Edit tags, snooze, archive                                  │
│  • Mark done → Triggers spaced repetition                      │
│                                                                 │
│  Additional Pages:                                             │
│  • /inspect - Daily review (new + due cards)                   │
│  • /library - Search & filter (coming soon)                    │
│  • /implement - Active projects (coming soon)                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     DATA PERSISTENCE (MongoDB)                  │
│                                                                 │
│  Collections:                                                   │
│  ┌─────────────────────────────────────────┐                  │
│  │ CARDS                                   │                  │
│  │ • userId, content, summary              │                  │
│  │ • tags[], topic, sentiment              │                  │
│  │ • status (inbox/indexed/inspect/...)    │                  │
│  │ • reviewCount, nextSurfaceAt            │                  │
│  │ • capturedAt, isArchived                │                  │
│  └─────────────────────────────────────────┘                  │
│  ┌─────────────────────────────────────────┐                  │
│  │ USERS                                   │                  │
│  │ • whatsappNumber, name, timezone        │                  │
│  └─────────────────────────────────────────┘                  │
│  ┌─────────────────────────────────────────┐                  │
│  │ PROJECTS (future)                       │                  │
│  │ • name, description, color              │                  │
│  └─────────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. WhatsApp Message → Card Creation

```
┌─────────────────────────────────────────────────────────────┐
│ WhatsApp Message:                                           │
│ "Read The Mom Test by Rob Fitzpatrick"                     │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ Webhook Processing:                                         │
│ 1. Verify HMAC signature                                   │
│ 2. Extract text: "Read The Mom Test..."                    │
│ 3. Return 200 OK immediately                               │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ AI Enrichment (Claude):                                     │
│ {                                                           │
│   tags: ["books", "startups", "customer-research"],        │
│   topic: "customer interviews",                            │
│   summary: "Read The Mom Test book for interviews",        │
│   sentiment: "positive"                                    │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ MongoDB Card:                                               │
│ {                                                           │
│   content: "Read The Mom Test by Rob Fitzpatrick",         │
│   summary: "Read The Mom Test book for interviews",        │
│   tags: ["books", "startups", "customer-research"],        │
│   topic: "customer interviews",                            │
│   sentiment: "positive",                                   │
│   status: "indexed",  ← Starts in Index column             │
│   reviewCount: 0,                                          │
│   nextSurfaceAt: now + 24h                                 │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ WhatsApp Reply:                                             │
│ "✓ Captured: Read The Mom Test book for interviews"        │
└─────────────────────────────────────────────────────────────┘
```

### 2. Card Workflow: Index → Done

```
┌─────────────────────────────────────────────────────────────┐
│ User Action: Drag card from "Index" to "Done"              │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ Frontend:                                                    │
│ 1. Optimistically update UI (move card visually)           │
│ 2. PATCH /api/cards/:id { status: "done" }                 │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ Backend Logic (Spaced Repetition):                         │
│ reviewCount = 0 → 1                                        │
│ interval = REVIEW_INTERVALS[1] = 3 days                    │
│ nextSurfaceAt = now + 3 days                               │
│ lastReviewedAt = now                                       │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ Result:                                                      │
│ Card moves to "Done" column                                │
│ Will resurface in /inspect after 3 days                    │
└─────────────────────────────────────────────────────────────┘
```

### 3. Spaced Repetition Schedule

```
Review #1: Mark done → Resurface in 1 day
Review #2: Mark done → Resurface in 3 days
Review #3: Mark done → Resurface in 7 days
Review #4: Mark done → Resurface in 14 days
Review #5+: Mark done → Resurface in 30 days
```

## Technology Stack Details

### Frontend
```
Next.js 14 (App Router)
  ├── React 18
  ├── Tailwind CSS
  ├── shadcn/ui components
  │   ├── Sheet (slide-over panel)
  │   ├── Button
  │   ├── Badge
  │   └── Input
  ├── @hello-pangea/dnd (drag & drop)
  ├── next-themes (dark mode)
  ├── date-fns (date formatting)
  └── sonner (toast notifications)
```

### Backend
```
Next.js API Routes
  ├── /api/cards (GET, POST)
  ├── /api/cards/[id] (PATCH, DELETE)
  └── /api/webhook/whatsapp (GET, POST)
```

### Database
```
MongoDB (Mongoose ORM)
  ├── Connection singleton pattern
  ├── Models: Card, User, Project
  └── Indexes on: userId, status, isArchived
```

### External APIs
```
Anthropic Claude API
  ├── Model: claude-sonnet-4-5
  ├── Max tokens: 256
  └── Returns: JSON with tags, topic, summary, sentiment

Meta WhatsApp Cloud API (v20.0)
  ├── Webhook: POST incoming messages
  ├── Send API: POST outgoing messages
  └── Media API: GET media files
```

## File Structure Overview

```
/app
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── cards/
│   │   │   ├── route.js          # List + Create
│   │   │   └── [id]/route.js     # Update + Delete
│   │   └── webhook/
│   │       └── whatsapp/route.js # WhatsApp webhook
│   ├── inspect/page.js           # Daily review
│   ├── library/page.js           # Search (placeholder)
│   ├── implement/page.js         # Projects (placeholder)
│   ├── settings/page.js          # Settings (placeholder)
│   ├── page.js                   # Main Kanban board
│   ├── layout.js                 # Root layout + sidebar
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── kanban/
│   │   ├── Board.jsx             # Main board + DnD
│   │   ├── Column.jsx            # Single column
│   │   └── Card.jsx              # Draggable card
│   ├── cards/
│   │   └── CardDetail.jsx        # Detail slide-over
│   └── ui/                       # shadcn components
│
├── lib/                          # Core business logic
│   ├── mongodb.js                # DB connection
│   ├── constants.js              # App constants
│   ├── models/
│   │   ├── Card.js
│   │   ├── User.js
│   │   └── Project.js
│   └── agent/
│       ├── enrichment.js         # Claude AI
│       ├── whatsapp.js           # Send messages
│       └── waba-agent.js         # Process webhook
│
├── scripts/
│   └── seed.js                   # Database seeding
│
├── .env.local.example            # Environment template
├── package.json
├── next.config.js
├── tailwind.config.js
├── README.md                     # Full documentation
└── SETUP.md                      # Quick start guide
```

## Environment Variables

```env
# Required for basic functionality
MONGODB_URI=mongodb://localhost:27017/addbrain

# Required for AI enrichment
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Optional for WhatsApp integration
WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_token
WHATSAPP_APP_SECRET=your_secret
```

## API Request/Response Examples

### Create Card
```bash
POST /api/cards
Content-Type: application/json

{
  "content": "Build a recommendation engine using collaborative filtering"
}

# Response:
{
  "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "userId": "65f1a2b3c4d5e6f7g8h9i0j0",
  "content": "Build a recommendation engine using collaborative filtering",
  "summary": "Build collaborative filtering recommendation engine",
  "tags": ["ml", "recommendation", "algorithms"],
  "topic": "recommendation systems",
  "sentiment": "neutral",
  "status": "indexed",
  "reviewCount": 0,
  "capturedAt": "2024-01-15T10:30:00.000Z",
  "nextSurfaceAt": "2024-01-16T10:30:00.000Z"
}
```

### Update Card Status
```bash
PATCH /api/cards/65f1a2b3c4d5e6f7g8h9i0j1
Content-Type: application/json

{
  "status": "implement"
}

# Response: Updated card object
```

### List Cards
```bash
GET /api/cards?status=indexed

# Response: Array of cards with status="indexed"
```

## Key Features Summary

✅ **Implemented & Working**
- WhatsApp webhook with HMAC verification
- AI enrichment (Claude)
- Kanban board with drag & drop
- Card CRUD operations
- Spaced repetition
- Dark mode
- Daily review page
- Toast notifications

⏳ **Placeholders (Ready for Implementation)**
- Library search page
- Project management
- User settings
- Voice transcription
- Real-time updates
- Multi-user authentication

---

**Status**: ✅ Fully functional MVP ready for API keys
**Demo User**: +91 9995554710
**Sample Cards**: 15 seeded cards across all columns
