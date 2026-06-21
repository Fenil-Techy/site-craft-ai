import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { usersTable, projectTable, generationLogsTable } from "@/config/schema";
import { desc, sql } from "drizzle-orm";
import Header from "../_components/Header";
import AdminClient from "./AdminClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await currentUser();

  // 1. Auth check
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Unauthorized</h1>
          <p className="text-zinc-400 mb-6">Please sign in to access the administrator dashboard.</p>
          <Link href="/sign-in" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-xl transition duration-200">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const adminClerkId = process.env.ADMIN_CLERK_ID;

  // 2. Authorization check
  if (!adminClerkId || user.id !== adminClerkId) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-lg w-full text-center shadow-xl">
          <h1 className="text-2xl font-bold text-amber-500 mb-4">Access Denied</h1>
          <p className="text-zinc-400 mb-6">
            Your account does not have permission to access this area.
          </p>
          {!adminClerkId && (
            <div className="bg-zinc-950 border border-yellow-500/20 text-yellow-200 p-4 rounded-lg mb-6 text-sm text-left font-mono">
              <span className="font-bold text-yellow-500">Notice to Developer:</span>
              <br />
              Please define <code className="bg-zinc-900 px-1 py-0.5 rounded text-white">ADMIN_CLERK_ID</code> in your env variables with value:
              <br />
              <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-white select-all block mt-2 p-1 overflow-x-auto text-xs">{user.id}</code>
            </div>
          )}
          <Link href="/workspace" className="inline-block bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-6 rounded-xl transition duration-200">
            Back to Workspace
          </Link>
        </div>
      </div>
    );
  }

  // 3. Fetch admin stats directly from DB
  // Fetch users
  const rawUsers = await db.select().from(usersTable);

  // Fetch project counts per user
  const projectCounts = await db
    .select({
      createdBy: projectTable.createdBy,
      count: sql<number>`count(${projectTable.id})::int`,
    })
    .from(projectTable)
    .groupBy(projectTable.createdBy);

  // Fetch last active timestamp from generation logs
  const lastActiveLogs = await db
    .select({
      userId: generationLogsTable.userId,
      lastActive: sql<string>`max(${generationLogsTable.createdOn})`,
    })
    .from(generationLogsTable)
    .groupBy(generationLogsTable.userId);

  // Build mapped users list
  const users = rawUsers.map((u) => {
    const projCount = projectCounts.find((p) => p.createdBy === u.id)?.count || 0;
    const lastActiveStr = lastActiveLogs.find((l) => l.userId === u.id)?.lastActive;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      credits: u.credits,
      maxCredits: u.maxCredits,
      tier: u.tier,
      clerkId: u.clerkId,
      projectCount: projCount,
      lastActive: lastActiveStr ? new Date(lastActiveStr).toISOString() : null,
    };
  });

  // Fetch last 50 generation logs
  const rawLogs = await db
    .select({
      id: generationLogsTable.id,
      userId: generationLogsTable.userId,
      model: generationLogsTable.model,
      durationMs: generationLogsTable.durationMs,
      promptTokens: generationLogsTable.promptTokens,
      completionTokens: generationLogsTable.completionTokens,
      mode: generationLogsTable.mode,
      createdOn: generationLogsTable.createdOn,
    })
    .from(generationLogsTable)
    .orderBy(desc(generationLogsTable.id))
    .limit(50);

  const logs = rawLogs.map((l) => {
    const userObj = rawUsers.find((u) => u.id === l.userId);
    return {
      id: l.id,
      email: userObj?.email || `User #${l.userId}`,
      model: l.model,
      durationMs: l.durationMs,
      promptTokens: l.promptTokens,
      completionTokens: l.completionTokens,
      mode: l.mode,
      createdOn: l.createdOn ? new Date(l.createdOn).toISOString() : null,
    };
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-zinc-400 mt-1">Manage users, adjust credit allocations, and monitor system generation logs.</p>
          </div>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Developer Mode Active
          </div>
        </div>

        <AdminClient initialUsers={users} initialLogs={logs} />
      </main>
    </div>
  );
}
