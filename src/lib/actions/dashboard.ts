import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

export async function getDashboardData(userId: string) {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  // Get current day name in Indonesian for Course matching
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const indonesianDay = dayNames[today.getDay()];

  try {
    const [
      tasksToday, 
      coursesToday, 
      habits, 
      financeSummary, 
      upcomingEvents, 
      goals
    ] = await Promise.all([
      // 1. Tasks due today or overdue
      prisma.task.findMany({
        where: {
          userId,
          status: { not: "done" },
          OR: [
            { dueDate: { lte: todayEnd } },
            { priority: "high" }
          ]
        },
        take: 5,
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }]
      }),

      // 2. Courses for today
      prisma.course.findMany({
        where: {
          userId,
          day: indonesianDay
        },
        orderBy: { startTime: 'asc' }
      }),

      // 3. Habits with today's logs
      prisma.habit.findMany({
        where: { userId },
        include: {
          logs: {
            where: {
              date: {
                gte: todayStart,
                lte: todayEnd
              }
            }
          }
        }
      }),

      // 4. Finance Summary
      prisma.financeTransaction.aggregate({
        where: {
          userId,
          date: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: { amount: true }
      }),

      // 5. Upcoming Events
      prisma.event.findMany({
        where: {
          userId,
          start: { gte: todayStart }
        },
        take: 3,
        orderBy: { start: 'asc' }
      }),

      // 6. Active Goals
      prisma.goal.findMany({
        where: { userId },
        take: 2,
        orderBy: { updatedAt: 'desc' }
      })
    ]);

    // Additional Finance: Get Budget summary
    const budgetTotal = await prisma.financeBudget.aggregate({
      where: { userId },
      _sum: { budget: true }
    });

    return {
      tasks: tasksToday,
      courses: coursesToday,
      habits: habits.map(h => ({
        ...h,
        isCompletedToday: h.logs.length > 0 && h.logs[0].isCompleted
      })),
      finance: {
        spent: financeSummary._sum.amount || 0,
        budget: budgetTotal._sum.budget || 0
      },
      events: upcomingEvents,
      goals: goals
    };
  } catch (error) {
    console.error("Dashboard Data Fetch Error:", error);
    return null;
  }
}
