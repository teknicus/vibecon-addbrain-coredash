import { connectDB } from '@/lib/mongodb';
import { Card } from '@/lib/models/Card';
import { User } from '@/lib/models/User';
import { Board } from '@/components/kanban/Board';

const DEMO_USER_PHONE = '919995554710';

export default async function DashboardPage() {
  await connectDB();
  
  const user = await User.findOneAndUpdate(
    { whatsappNumber: DEMO_USER_PHONE },
    { $setOnInsert: { whatsappNumber: DEMO_USER_PHONE } },
    { upsert: true, new: true }
  );

  const cards = await Card.find({
    userId: user._id.toString(),
    isArchived: false,
  })
    .sort({ capturedAt: -1 })
    .limit(200)
    .lean();

  const serialized = JSON.parse(JSON.stringify(cards));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          🧠 AddBrain CORE
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Organize • Review • Execute
        </p>
      </div>
      <Board initialCards={serialized} />
    </div>
  );
}
