# Card Insertion Quick Reference

## MongoDB Connection Details

- **Database**: `addbrain` (or whatever you set in MONGODB_URI)
- **Collection**: `cards`
- **Connection**: `mongodb://localhost:27017` (from .env)

## 🎯 Important: CORE Dashboard is Read-Only

**CORE Dashboard does NOT enrich or process cards.** It is a pure visual layer that reads from MongoDB.

External agents are responsible for:
- ✅ Capturing messages/notes
- ✅ AI enrichment (tags, topics, summaries, sentiment)
- ✅ Direct MongoDB insertion

The dashboard only:
- 📊 Displays cards in Kanban board
- ✏️ Allows status updates, tag editing, archiving
- 🔍 Provides daily review and search

## Demo User Info

```javascript
{
  _id: "69e132c577b743408d7530c7",  // Auto-generated
  whatsappNumber: "919995554710",
  name: "Demo User",
  timezone: "Asia/Kolkata"
}
```

## Minimal Card Structure (Required Fields Only)

```javascript
{
  userId: "69e132c577b743408d7530c7",  // Use the demo user's _id
  content: "Your message text here",
  status: "indexed"
}
```

## Recommended Card Structure (With Enrichment)

```javascript
{
  userId: "69e132c577b743408d7530c7",
  content: "Build a recommendation engine using collaborative filtering",
  
  // Source
  sourceType: "text",  // 'text' | 'voice' | 'image' | 'link' | 'manual'
  mediaUrl: null,      // WhatsApp media ID or URL (optional)
  
  // AI Enrichment
  tags: ["ml", "recommendation", "algorithms"],
  topic: "recommendation systems",
  summary: "Build collaborative filtering recommendation engine",
  sentiment: "neutral",  // 'positive' | 'neutral' | 'negative'
  
  // Workflow
  status: "indexed",  // 'inbox' | 'indexed' | 'inspect' | 'implement' | 'done'
  
  // Spaced Repetition
  reviewCount: 0,
  lastReviewedAt: null,
  nextSurfaceAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  snoozedUntil: null,
  
  // Organization
  projectId: null,
  relatedCardIds: [],
  
  // Metadata
  capturedAt: new Date(),
  isArchived: false
}
```

## 2 Ways to Insert Cards

### Option 1: REST API (For Manual/UI Creation)

```bash
curl -X POST http://localhost:3000/api/cards \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your message here",
    "sourceType": "text",
    "tags": ["product", "idea"],
    "topic": "product idea",
    "summary": "One sentence summary",
    "sentiment": "positive"
  }'
```

**Notes:**
- ⚠️ No AI enrichment happens server-side
- External agents must provide enriched fields
- Missing fields default to empty (tags: [], topic: '', summary: '', sentiment: 'neutral')

### Option 2: Direct MongoDB Insertion (Recommended for Agents)

```javascript
import mongoose from 'mongoose';
import { Card } from './lib/models/Card.js';

await mongoose.connect('mongodb://localhost:27017');

await Card.create({
  userId: "69e132c577b743408d7530c7",  // Demo user ID
  content: "Your message",
  sourceType: "text",
  status: "indexed",
  tags: [],
  topic: "",
  summary: "",
  sentiment: "neutral",
  capturedAt: new Date(),
  nextSurfaceAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  isArchived: false,
});
```

## Field Validation Rules

### Required
- `userId` (String)
- `content` (String)

### Enums
- `sourceType`: ['text', 'voice', 'image', 'link', 'manual']
- `sentiment`: ['positive', 'neutral', 'negative']
- `status`: ['inbox', 'indexed', 'inspect', 'implement', 'done']

### Defaults (Auto-filled if not provided)
```javascript
{
  sourceType: 'text',
  tags: [],
  topic: '',
  summary: '',
  sentiment: 'neutral',
  status: 'inbox',
  reviewCount: 0,
  lastReviewedAt: null,
  nextSurfaceAt: Date.now() + 24h,
  snoozedUntil: null,
  relatedCardIds: [],
  capturedAt: Date.now(),
  isArchived: false
}
```

## Status Workflow

Cards flow through these statuses:

```
inbox → indexed → inspect → implement → done
```

- **inbox**: Just captured, not yet processed
- **indexed**: Enriched and ready for review
- **inspect**: Flagged for closer examination
- **implement**: Actively working on it
- **done**: Completed (triggers spaced repetition)

## AI Enrichment

⚠️ **CORE Dashboard does NOT perform AI enrichment.**

External agents must enrich cards before insertion. Recommended enrichment:

```javascript
// External agent enriches BEFORE inserting
{
  content: "Read The Mom Test by Rob Fitzpatrick",
  tags: ["books", "startups", "customer-research"],
  topic: "customer interviews",
  summary: "Read The Mom Test book for customer research",
  sentiment: "positive"
}
```

If fields are missing, defaults are used:
```javascript
{
  tags: [],
  topic: "",
  summary: content.slice(0, 60),  // First 60 chars of content
  sentiment: "neutral"
}
```

## Example: Python Agent Insertion

```python
import requests
from datetime import datetime

# Insert via API
def insert_card(content, source_type='text'):
    response = requests.post(
        'http://localhost:3000/api/cards',
        json={
            'content': content,
            'sourceType': source_type
        }
    )
    return response.json()

# Example usage
card = insert_card("Build a mobile app with offline sync")
print(f"Created card: {card['_id']}")
```

## Example: Direct MongoDB with Python

```python
from pymongo import MongoClient
from datetime import datetime, timedelta

client = MongoClient('mongodb://localhost:27017')
db = client['addbrain']

# Insert card
card = db.cards.insert_one({
    'userId': '69e132c577b743408d7530c7',
    'content': 'Build a mobile app with offline sync',
    'sourceType': 'text',
    'status': 'indexed',
    'tags': ['mobile', 'architecture'],
    'topic': 'mobile development',
    'summary': 'Build offline-capable mobile app',
    'sentiment': 'neutral',
    'reviewCount': 0,
    'lastReviewedAt': None,
    'nextSurfaceAt': datetime.now() + timedelta(days=1),
    'capturedAt': datetime.now(),
    'isArchived': False,
})

print(f"Inserted card: {card.inserted_id}")
```

## Verify Insertion

```bash
# Check total cards
curl http://localhost:3000/api/cards | jq 'length'

# View latest card
curl http://localhost:3000/api/cards | jq '.[0]'

# Filter by status
curl 'http://localhost:3000/api/cards?status=indexed' | jq 'length'
```

## Common Mistakes to Avoid

❌ **Wrong:** Using MongoDB ObjectId for userId
```javascript
userId: ObjectId("69e132c577b743408d7530c7")  // Don't do this
```

✅ **Correct:** Using string
```javascript
userId: "69e132c577b743408d7530c7"  // Do this
```

---

❌ **Wrong:** Invalid status value
```javascript
status: "pending"  // Not in enum
```

✅ **Correct:** Valid enum value
```javascript
status: "indexed"  // Valid
```

---

❌ **Wrong:** Not setting nextSurfaceAt
```javascript
// Card will never surface in /inspect
```

✅ **Correct:** Set future date
```javascript
nextSurfaceAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
```

## Need Help?

- View card model: `/app/lib/models/Card.js`
- View insertion logic: `/app/lib/agent/waba-agent.js`
- Test insertion: `/app/scripts/seed.js`
- API documentation: `/app/README.md`
