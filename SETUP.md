# 🚀 Quick Setup Guide

## What Has Been Built

✅ **Full-Stack WhatsApp Knowledge Management Tool**
- Kanban board with 5 columns (Inbox → Index → Inspect → Implement → Done)
- WhatsApp webhook integration (ready for your credentials)
- AI enrichment with Claude (tags, topics, summaries, sentiment)
- Drag & drop cards between columns
- Card detail panel with actions
- Dark mode support
- MongoDB persistence with 15 sample cards

## Current Status

🎉 **Application is RUNNING and WORKING**
- ✅ Backend APIs tested and functional
- ✅ Frontend rendering correctly
- ✅ Database seeded with 15 sample cards
- ✅ Drag & drop working
- ✅ All CRUD operations working

## Next Steps: Add Your API Keys

### 1. Copy Environment Template

```bash
cp .env.local.example .env.local
```

### 2. Add Your API Keys

Edit `.env.local` with your credentials:

```env
# MongoDB (already configured)
MONGODB_URI=mongodb://localhost:27017/addbrain

# ⚠️ REQUIRED: Anthropic API for AI enrichment
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Optional: WhatsApp Business Cloud API (for live message capture)
WHATSAPP_ACCESS_TOKEN=your_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_id_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_custom_token_here
WHATSAPP_APP_SECRET=your_app_secret_here
```

### 3. Get API Keys

#### Anthropic (Claude AI) - For Card Enrichment
1. Go to https://console.anthropic.com/settings/keys
2. Create a new API key
3. Copy it to `ANTHROPIC_API_KEY` in `.env.local`

**What it does:** Automatically extracts tags, topics, summaries, and sentiment from each card

#### WhatsApp (Optional) - For Live Message Capture
1. Go to https://developers.facebook.com/apps
2. Create a WhatsApp Business app
3. Get credentials from WhatsApp > API Setup:
   - Access Token
   - Phone Number ID
   - Create your own Webhook Verify Token (any string)
   - App Secret (for HMAC verification)
4. Configure webhook URL: `https://your-domain.com/api/webhook/whatsapp`

**What it does:** Captures messages from WhatsApp (+919995554710) and creates cards automatically

### 4. Restart the Server

After adding keys:

```bash
# Restart to load new environment variables
sudo supervisorctl restart nextjs
```

Or if running in dev mode:
```bash
yarn dev
```

## Testing the Application

### View the Dashboard
Visit: http://localhost:3000

You should see:
- 5 columns (Inbox, Index, Inspect, Implement, Done)
- 15 sample cards distributed across columns
- Drag & drop cards between columns
- Click any card to see details

### Test Card Creation

```bash
# Create a new card via API
curl -X POST http://localhost:3000/api/cards \
  -H "Content-Type: application/json" \
  -d '{"content": "Build a mobile app with offline-first architecture"}'
```

With Anthropic API key configured, the response will include:
- `tags`: ["mobile", "architecture", "offline"]
- `topic`: "mobile architecture"
- `summary`: "Build offline-first mobile app architecture"
- `sentiment`: "neutral"

### Test WhatsApp Webhook (if configured)

1. Configure webhook in Meta Developer Console
2. Send a WhatsApp message to your number
3. Check if card appears in the "Index" column
4. You'll receive a confirmation: "✓ Captured: [summary]"

## Features You Can Use Now

### ✅ Without API Keys
- ✅ View all 15 sample cards
- ✅ Drag & drop cards between columns
- ✅ Create cards manually (basic enrichment)
- ✅ Edit card tags
- ✅ Archive cards
- ✅ Snooze cards
- ✅ Mark cards as done (triggers spaced repetition)

### 🔑 With Anthropic API Key
- ✅ All above features
- ✅ **AI-powered enrichment**: Smart tags, topics, summaries
- ✅ Sentiment analysis

### 📱 With WhatsApp API
- ✅ All above features
- ✅ **Live message capture**: Send messages to WhatsApp
- ✅ Automatic card creation
- ✅ WhatsApp confirmation messages
- ✅ Support for text, voice notes, images, documents

## Available Pages

- `/` - Main Kanban board (fully functional)
- `/inspect` - Daily review page (shows new + due cards)
- `/library` - Search all cards (placeholder)
- `/implement` - Active projects (placeholder)
- `/settings` - User settings (placeholder)

## API Endpoints

### Cards
- `GET /api/cards` - List all cards
- `GET /api/cards?status=indexed` - Filter by status
- `POST /api/cards` - Create new card
- `PATCH /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Archive card

### WhatsApp Webhook
- `GET /api/webhook/whatsapp` - Verification endpoint
- `POST /api/webhook/whatsapp` - Incoming messages

## Demo User

All cards are associated with the demo user:
- **Phone**: +919995554710
- **Name**: Demo User
- **Timezone**: Asia/Kolkata

## Troubleshooting

### Cards not enriching properly?
→ Add `ANTHROPIC_API_KEY` to `.env.local` and restart

### WhatsApp webhook not working?
→ Check:
1. All 4 WhatsApp env vars are set
2. Webhook URL is accessible (use ngrok for local testing)
3. HMAC signature verification is passing
4. Check logs: `tail -f /var/log/supervisor/nextjs.out.log`

### MongoDB connection error?
→ Ensure MongoDB is running:
```bash
sudo supervisorctl status mongodb
```

### Need to reset database?
```bash
npm run seed
```

## What's Next?

1. **Add API keys** for full functionality
2. **Test drag & drop** on the Kanban board
3. **Create cards** via the API or WhatsApp
4. **Implement authentication** for production use
5. **Add voice transcription** for voice notes
6. **Build out Library page** with search
7. **Add project management** features

---

**Need help?** Check the main README.md for detailed documentation.

**Ready to go!** Your AddBrain CORE Dashboard is fully built and waiting for your API keys. 🎉
