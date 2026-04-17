# Cleanup Summary: WhatsApp Webhook & AI Enrichment Removal

## Date: 2024

## Reason
CORE Dashboard has been repositioned as a **pure visual layer**. It no longer handles message capture or AI enrichment. External agents are responsible for these tasks and insert pre-enriched cards directly to MongoDB.

## Files Deleted (4 files)

1. **app/api/webhook/whatsapp/route.js**
   - WhatsApp webhook verification (GET)
   - Incoming message handler with HMAC verification (POST)
   - ~70 lines removed

2. **lib/agent/waba-agent.js**
   - Orchestrator for message processing
   - User lookup, enrichment call, card insertion, WhatsApp reply
   - ~100 lines removed

3. **lib/agent/enrichment.js**
   - Claude API integration for card enrichment
   - Tag, topic, summary, sentiment extraction
   - ~60 lines removed

4. **lib/agent/whatsapp.js**
   - WhatsApp send message helper
   - Graph API v20.0 integration
   - ~40 lines removed

**Directories removed:**
- `app/api/webhook/` (empty after file deletion)
- `lib/agent/` (empty after file deletion)

## Dependencies Removed

**package.json:**
- `@anthropic-ai/sdk` - Claude AI SDK (no longer needed)

## Environment Variables Removed

**From .env.local.example:**
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`
- `ANTHROPIC_API_KEY`

**Remaining (only 1 required):**
- `MONGODB_URI` - Database connection

## Code Changes

### app/api/cards/route.js

**Before:**
```javascript
import { enrichCard } from '@/lib/agent/enrichment';

export async function POST(request) {
  const { content, sourceType = 'manual', projectId } = body;
  const enrichment = await enrichCard(content);
  
  const card = await Card.create({
    userId,
    content,
    sourceType,
    tags: enrichment.tags,
    topic: enrichment.topic,
    summary: enrichment.summary,
    sentiment: enrichment.sentiment,
    status: 'indexed',
  });
}
```

**After:**
```javascript
// No enrichCard import

export async function POST(request) {
  const { 
    content, 
    sourceType = 'manual',
    tags = [],
    topic = '',
    summary = '',
    sentiment = 'neutral',
    projectId 
  } = body;
  
  const card = await Card.create({
    userId,
    content,
    sourceType,
    tags,
    topic,
    summary: summary || content.slice(0, 60),
    sentiment,
    status: 'indexed',
  });
}
```

**Key differences:**
- No AI enrichment server-side
- Accepts pre-enriched fields from external agents
- Defaults to empty values if not provided

## What Still Works

✅ **All display functionality:**
- Kanban board with drag & drop
- Card detail panel
- Status updates
- Tag editing
- Archive/snooze/mark done
- Daily review page (`/inspect`)
- Library, Implement, Settings pages

✅ **All CRUD operations:**
- GET /api/cards (list with filters)
- POST /api/cards (create with pre-enriched fields)
- PATCH /api/cards/[id] (update status, tags, etc.)
- DELETE /api/cards/[id] (soft delete)

✅ **MongoDB models:**
- Card, User, Project schemas unchanged
- All indexes preserved

✅ **Spaced repetition:**
- Still works when marking cards as "done"
- Intervals: [1, 3, 7, 14, 30] days

✅ **Seed script:**
- `npm run seed` still works (15 sample cards)

## What External Agents Must Do

External agents are now responsible for:

1. **Message Capture**
   - Listen for WhatsApp messages, emails, etc.
   - Extract content, media, timestamps

2. **AI Enrichment**
   - Call Claude/GPT/Gemini for analysis
   - Extract: tags (array), topic (string), summary (string), sentiment (enum)

3. **Direct MongoDB Insertion**
   - Connect to MongoDB
   - Insert enriched card to `cards` collection
   - Use demo user: `whatsappNumber: "919995554710"`

## Example External Agent Flow

```javascript
// 1. Capture message
const message = await captureWhatsAppMessage();

// 2. Enrich with AI
const enrichment = await callClaudeAPI(message.content);

// 3. Insert to MongoDB
await mongoose.connect(process.env.MONGODB_URI);
const user = await User.findOne({ whatsappNumber: '919995554710' });

await Card.create({
  userId: user._id.toString(),
  content: message.content,
  sourceType: 'text',
  tags: enrichment.tags,
  topic: enrichment.topic,
  summary: enrichment.summary,
  sentiment: enrichment.sentiment,
  status: 'indexed',
  capturedAt: new Date(),
});
```

## Migration Path for Existing Setups

If you were using the built-in WhatsApp webhook:

1. **Create external agent** to handle webhook
2. **Move WHATSAPP_* and ANTHROPIC_API_KEY** to agent's .env
3. **Port enrichment logic** from deleted `lib/agent/enrichment.js`
4. **Port webhook logic** from deleted `app/api/webhook/whatsapp/route.js`
5. **Update agent to insert directly** to MongoDB instead of calling POST /api/cards

## Testing Verification

All tests passed ✅

```bash
✅ webhook dir removed
✅ agent dir removed
✅ @anthropic-ai/sdk removed from package.json
✅ Returns 15 cards from GET /api/cards
✅ Created card with pre-enriched fields (POST /api/cards)
✅ Created card with minimal fields (defaults applied)
✅ Board page renders correctly
✅ No errors in server logs
```

## Documentation Updated

Files updated to reflect new architecture:

1. **README.md** - Architecture section updated
2. **CARD_INSERTION_GUIDE.md** - Removed webhook/enrichment info
3. **.env.local.example** - Only MONGODB_URI remains
4. **This file** - Cleanup summary

## Benefits of This Change

1. **Separation of Concerns**
   - CORE = Visual layer only
   - External agents = Capture + Enrichment

2. **Flexibility**
   - Multiple agents can insert cards
   - Each agent can use different AI models
   - No coupling to WhatsApp

3. **Simplicity**
   - Fewer dependencies
   - No API keys in CORE
   - Easier to deploy

4. **Scalability**
   - Agents can scale independently
   - CORE focuses on UI performance
   - MongoDB as single source of truth

## Questions?

See:
- `/app/CARD_INSERTION_GUIDE.md` - How external agents insert cards
- `/app/README.md` - Updated architecture overview
- `/app/examples/insert-cards.js` - Code examples
