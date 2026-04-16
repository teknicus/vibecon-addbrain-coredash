import { connectDB } from '@/lib/mongodb';
import { Card } from '@/lib/models/Card';
import { User } from '@/lib/models/User';

const DEMO_USER_PHONE = '919995554710';

export default async function InspectPage() {
  await connectDB();
  const user = await User.findOne({ whatsappNumber: DEMO_USER_PHONE });

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
          Daily Review
        </h1>
        <p className="text-sm text-slate-500">No data yet. Send a message to WhatsApp to get started.</p>
      </div>
    );
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const [newCards, dueCards] = await Promise.all([
    Card.find({
      userId: user._id.toString(),
      isArchived: false,
      capturedAt: { $gte: todayStart },
      status: 'indexed',
    })
      .sort({ capturedAt: -1 })
      .lean(),

    Card.find({
      userId: user._id.toString(),
      isArchived: false,
      status: { $in: ['indexed', 'inspect'] },
      nextSurfaceAt: { $lte: now },
    })
      .sort({ nextSurfaceAt: 1 })
      .lean(),
  ]);

  const serializedNew = JSON.parse(JSON.stringify(newCards));
  const serializedDue = JSON.parse(JSON.stringify(dueCards));

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
        Daily Review
      </h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
            New Today ({serializedNew.length})
          </h2>
          {serializedNew.length === 0 ? (
            <p className="text-sm text-slate-400">No new cards today</p>
          ) : (
            <div className="space-y-2">
              {serializedNew.map((card) => (
                <div
                  key={card._id}
                  className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {card.summary || card.content}
                  </p>
                  {card.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full px-2 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
            Due for Review ({serializedDue.length})
          </h2>
          {serializedDue.length === 0 ? (
            <p className="text-sm text-slate-400">No cards due for review</p>
          ) : (
            <div className="space-y-2">
              {serializedDue.map((card) => (
                <div
                  key={card._id}
                  className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {card.summary || card.content}
                  </p>
                  {card.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full px-2 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
