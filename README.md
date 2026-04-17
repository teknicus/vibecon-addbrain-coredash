# 🧠 AddBrain CORE Dashboard

A visual layer for WhatsApp-based personal knowledge management. CORE displays and manages cards inserted by external agents.

## 🎯 Architecture

**CORE Dashboard = Pure Visual Layer**

- ✅ Reads cards from MongoDB
- ✅ Displays in Kanban board
- ✅ Allows status updates, tag editing, archiving
- ✅ Provides daily review and search

**External Agents = Capture + Enrichment**

- External agents handle message capture (WhatsApp, email, etc.)
- External agents perform AI enrichment (tags, topics, summaries)
- External agents insert enriched cards directly to MongoDB
- CORE displays the results

## 🎯 Features

- **WhatsApp Capture**: Receive messages via webhook and automatically enrich them with AI
- **Kanban Board**: 5-column workflow (Inbox → Index → Inspect → Implement → Done)
- **AI Enrichment**: Claude automatically extracts tags, topics, summaries, and sentiment
- **Drag & Drop**: Intuitive card management with @hello-pangea/dnd
- **Spaced Repetition**: Smart resurfacing based on review count
- **Daily Review**: See new cards and cards due for review
- **Dark Mode**: Full dark mode support with next-themes

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes (read/update only)
- **Database**: MongoDB with Mongoose
- **Drag & Drop**: @hello-pangea/dnd

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- External agents for card capture and enrichment

## 🚀 Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configure Environment Variables

Edit `.env.local` with your MongoDB connection:

```env
# MongoDB (Required)
MONGODB_URI=mongodb://localhost:27017/addbrain
```

That's it! No API keys needed - external agents handle enrichment.

### 3. Seed the Database

```bash
npm run seed
```

This creates a demo user (+91 9995554710) and populates the board with 15 sample cards.

### 4. Start Development Server

```bash
yarn dev
```

Visit http://localhost:3000 to see your Kanban board!

## 📱 WhatsApp Integration

### Setting Up Webhook

1. Go to [Meta for Developers](https://developers.facebook.com/apps)
2. Create a WhatsApp Business app
3. Get your credentials from WhatsApp > API Setup
4. Configure webhook URL: `https://your-domain.com/api/webhook/whatsapp`
5. Subscribe to `messages` events

### Webhook Endpoints

**GET** `/api/webhook/whatsapp` - Webhook verification
- Meta calls this during setup with challenge token

**POST** `/api/webhook/whatsapp` - Incoming messages
- Receives WhatsApp messages
- Verifies HMAC-SHA256 signature
- Processes message in background
- Returns 200 immediately (within 5s requirement)

### Supported Message Types

- ✅ Text messages
- ✅ Voice notes (stored as media ID)
- ✅ Images (with captions)
- ✅ Documents (with filenames)
- ✅ Links (auto-detected in text)

## 🎨 UI Components

### Kanban Board
- **5 Columns**: Inbox, Index, Inspect, Implement, Done
- **Drag & Drop**: Move cards between columns
- **Color-Coded**: Each status has a unique color
- **Responsive**: Works on desktop and tablet

### Card Detail Panel
- View full content and summary
- Edit tags inline
- Quick actions: Mark Done, Implement, Snooze, Archive
- Shows capture timestamp and review count

### Pages
- `/` - Main Kanban board
- `/inspect` - Daily review (new + due cards)
- `/library` - Search all cards (placeholder)
- `/implement` - Active projects (placeholder)
- `/settings` - Preferences (placeholder)

## 🔌 API Routes

### Cards API

**GET** `/api/cards`
- Query params: `status`, `projectId`, `search`
- Returns filtered cards

**POST** `/api/cards`
- Body: `{ content, sourceType, projectId }`
- Creates new card with AI enrichment

**PATCH** `/api/cards/[id]`
- Body: `{ status, tags, snoozedUntil, ... }`
- Updates card
- Special: status="done" triggers spaced repetition

**DELETE** `/api/cards/[id]`
- Soft delete (sets `isArchived: true`)

## 🤖 AI Enrichment

Claude (`claude-sonnet-4-5`) analyzes each captured note and extracts:

- **Tags**: 2-5 kebab-case topic tags (e.g., "product-strategy", "machine-learning")
- **Topic**: Single primary topic (max 3 words)
- **Summary**: One action-oriented sentence (max 15 words)
- **Sentiment**: positive | neutral | negative

Enrichment happens synchronously during card creation. If Claude API fails, safe defaults are used.

## 📊 Database Models

### Card
```javascript
{
  userId: String,
  content: String,
  sourceType: 'text' | 'voice' | 'image' | 'link' | 'manual',
  mediaUrl: String,
  tags: [String],
  topic: String,
  summary: String,
  sentiment: 'positive' | 'neutral' | 'negative',
  status: 'inbox' | 'indexed' | 'inspect' | 'implement' | 'done',
  reviewCount: Number,
  lastReviewedAt: Date,
  nextSurfaceAt: Date,
  snoozedUntil: Date,
  projectId: ObjectId,
  relatedCardIds: [ObjectId],
  capturedAt: Date,
  isArchived: Boolean
}
```

### User
```javascript
{
  whatsappNumber: String,
  email: String,
  name: String,
  timezone: String,
  digestTime: String
}
```

### Project
```javascript
{
  userId: String,
  name: String,
  description: String,
  color: String
}
```

## 🔄 Spaced Repetition

When a card is marked as "Done", it's scheduled to resurface based on review count:

- Review 1: 1 day
- Review 2: 3 days
- Review 3: 7 days
- Review 4: 14 days
- Review 5+: 30 days

Cards with `nextSurfaceAt <= now` appear in the Inspect page.

## 🔒 Security Notes

### ⚠️ No Authentication in v1
This demo uses a hardcoded user (`+919995554710`). For production:
- Add NextAuth.js
- Implement user sessions
- Add middleware to protect routes
- Link WhatsApp number to authenticated user

### HMAC Verification
WhatsApp webhook POST requests are verified using HMAC-SHA256:
1. Read raw request body (before JSON parsing)
2. Compute HMAC with `WHATSAPP_APP_SECRET`
3. Compare with `X-Hub-Signature-256` header
4. Reject if mismatch

## 📦 Project Structure

```
/app
├── app/
│   ├── api/
│   │   ├── cards/
│   │   │   ├── route.js           # GET + POST cards
│   │   │   └── [id]/route.js      # PATCH + DELETE card
│   │   └── webhook/
│   │       └── whatsapp/route.js  # WhatsApp webhook
│   ├── inspect/page.js            # Daily review page
│   ├── library/page.js            # Search page (placeholder)
│   ├── implement/page.js          # Projects page (placeholder)
│   ├── settings/page.js           # Settings page (placeholder)
│   ├── page.js                    # Main Kanban board
│   ├── layout.js                  # Root layout with sidebar
│   └── globals.css                # Global styles
├── components/
│   ├── kanban/
│   │   ├── Board.jsx              # Main Kanban board
│   │   ├── Column.jsx             # Single column
│   │   └── Card.jsx               # Card component
│   ├── cards/
│   │   └── CardDetail.jsx         # Card detail slide-over
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── mongodb.js                 # MongoDB connection singleton
│   ├── constants.js               # Constants and configs
│   ├── models/
│   │   ├── Card.js                # Card model
│   │   ├── User.js                # User model
│   │   └── Project.js             # Project model
│   └── agent/
│       ├── enrichment.js          # Claude AI enrichment
│       ├── whatsapp.js            # WhatsApp send helper
│       └── waba-agent.js          # Message processing orchestrator
├── scripts/
│   └── seed.js                    # Database seeding script
└── package.json
```

## 🧪 Testing

The application includes:
- Manual card creation (POST /api/cards)
- Webhook testing (POST /api/webhook/whatsapp with sample payload)
- Drag & drop testing in UI
- Card detail actions testing

## 🚧 Known Limitations (v1)

- No authentication (hardcoded demo user)
- Voice notes stored as media IDs (no transcription)
- No real-time updates (requires page refresh)
- No WebSocket/SSE for live notifications
- Library and Implement pages are placeholders

## 🎯 Next Steps

1. **Provide API Keys**: Add your Anthropic and WhatsApp credentials to `.env.local`
2. **Test Manually**: Create cards via POST /api/cards
3. **Set Up Webhook**: Configure WhatsApp webhook for live message capture
4. **Add Authentication**: Implement NextAuth.js for production
5. **Voice Transcription**: Add Whisper API for voice note transcription
6. **Real-Time**: Add WebSocket or Polling for live updates

## 📝 License

This is a demonstration project. Modify as needed for your use case.

## 🆘 Support

For issues or questions:
1. Check webhook logs in console
2. Verify HMAC signature implementation
3. Ensure MongoDB connection is working
4. Test API routes with curl/Postman

---

Built with ❤️ using Next.js 14, MongoDB, and Claude AI
