import React, { useEffect, useState } from "react";

type Task = { id: string; text: string; done?: boolean };
type Milestone = {
  id: string;
  title: string;
  subtitle?: string;
  tasks: Task[];
  locked?: boolean;
};

interface Props {
  milestones?: Milestone[];
}

const defaultData: Milestone[] = [
  {
    id: "m1",
    title: "Memulai Kebiasaan Baru (Pondasi)",
    tasks: [
      { id: "t1", text: "Mengisi profil & target mingguan", done: true },
      { id: "t2", text: "Melakukan check-in hari pertama", done: false },
    ],
  },
  {
    id: "m2",
    title: "Konsistensi 7 Hari",
    subtitle: "Unlock setelah M1",
    tasks: [
      { id: "t3", text: "Selesaikan 3 check-in" },
      { id: "t4", text: "Tandai 5 hari berturut-turut" },
    ],
    locked: true,
  },
];

export default function MilestonesDropdown({
  milestones = defaultData,
}: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Milestone[]>(milestones);
  const [confettiFor, setConfettiFor] = useState<string | null>(null);

  useEffect(() => setItems(milestones), [milestones]);

  const active = items[0];
  const totalTasks = active.tasks.length;
  const doneTasks = active.tasks.filter((t) => t.done).length;
  const percent = Math.round((doneTasks / Math.max(1, totalTasks)) * 100);

  function toggleTask(mId: string, tId: string) {
    setItems((prev) =>
      prev.map((m) => {
        if (m.id !== mId) return m;
        if (m.locked) return m;
        const tasks = m.tasks.map((t) =>
          t.id === tId ? { ...t, done: !t.done } : t,
        );
        const completed = tasks.every((t) => t.done);
        if (completed) {
          setConfettiFor(mId);
          setTimeout(() => setConfettiFor(null), 2200);
        }
        return { ...m, tasks };
      }),
    );
  }

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-gray-400"
            viewBox="0 0 24 24"
            fill="none">
            <path
              d="M5 3v16l7-3 7 3V3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-semibold text-gray-700">Milestones</span>
          <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full">
            {doneTasks}/{totalTasks}
          </span>
        </div>
        <button
          onClick={() => setOpen((s) => !s)}
          aria-expanded={open}
          className="focus:outline-none">
          <svg
            className={`w-5 h-5 text-gray-400 transform transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="none">
            <path
              d="M6 8l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Dropdown content */}
      {open && (
        <div className="mt-4 space-y-3">
          {items.map((m) => {
            const mTotal = m.tasks.length;
            const mDone = m.tasks.filter((t) => t.done).length;
            const mPercent = Math.round((mDone / Math.max(1, mTotal)) * 100);
            const completed = mDone === mTotal;

            return (
              <div
                key={m.id}
                className="relative bg-white rounded-lg p-3 border border-gray-100">
                {m.locked && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      🔒 {m.subtitle || "Terkunci"}
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                        {completed ? "✓" : "▢"}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {m.title}
                        </div>
                        {m.subtitle && (
                          <div className="text-xs text-gray-500">
                            {m.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 font-semibold">
                    {mDone}/{mTotal}
                  </div>
                </div>

                {/* per-milestone progress */}
                <div className="w-full bg-gray-100 h-1 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-1 rounded-full ${completed ? "bg-green-400" : "bg-blue-500"} transition-all duration-300`}
                    style={{ width: `${mPercent}%` }}
                  />
                </div>

                {/* tasks */}
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  {m.tasks.map((t) => (
                    <label
                      key={t.id}
                      className={`flex items-center gap-2 ${m.locked ? "opacity-60" : "cursor-pointer"}`}>
                      <input
                        type="checkbox"
                        checked={!!t.done}
                        onChange={() => toggleTask(m.id, t.id)}
                        disabled={m.locked}
                        className="w-4 h-4 rounded border-gray-300 text-blue-500"
                      />
                      <span
                        className={`${t.done ? "line-through text-gray-400" : ""}`}>
                        {t.text}
                      </span>
                    </label>
                  ))}
                </div>

                {/* confetti / success visual */}
                {confettiFor === m.id && (
                  <div className="absolute right-3 top-3 z-20 pointer-events-none">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 text-green-600 px-2 py-1 rounded-full font-semibold transform animate-bounce">
                        Selesai ✓
                      </div>
                    </div>
                    <div className="relative w-24 h-12">
                      <span className="absolute w-2 h-2 bg-pink-400 rounded-full -left-1 top-2 animate-ping" />
                      <span className="absolute w-2 h-2 bg-yellow-400 rounded-full left-4 top-4 animate-ping" />
                      <span className="absolute w-2 h-2 bg-blue-400 rounded-full left-10 top-1 animate-ping" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
