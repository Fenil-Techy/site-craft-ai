'use client'
import React, { useState } from "react";
import { Search, UserCog, RefreshCw, X, ShieldAlert, Cpu } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
  credits: number;
  maxCredits: number;
  tier: string;
  clerkId: string | null;
  projectCount: number;
  lastActive: string | null;
}

interface Log {
  id: number;
  email: string;
  model: string;
  durationMs: number | null;
  promptTokens: number | null;
  completionTokens: number | null;
  mode: string | null;
  createdOn: string | null;
}

interface AdminClientProps {
  initialUsers: User[];
  initialLogs: Log[];
}

export default function AdminClient({ initialUsers, initialLogs }: AdminClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [logs] = useState<Log[]>(initialLogs);
  const [activeTab, setActiveTab] = useState<"users" | "logs">("users");

  // Search & Filter state
  const [userSearch, setUserSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [logSearch, setLogSearch] = useState("");

  // Edit credits state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newCredits, setNewCredits] = useState<number>(0);
  const [newMaxCredits, setNewMaxCredits] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesTier = tierFilter === "all" || u.tier.toLowerCase() === tierFilter.toLowerCase();
    return matchesSearch && matchesTier;
  });

  // Filter logs
  const filteredLogs = logs.filter((l) => {
    return (
      l.email.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.model.toLowerCase().includes(logSearch.toLowerCase())
    );
  });

  const openAdjustDialog = (user: User) => {
    setEditingUser(user);
    setNewCredits(user.credits);
    setNewMaxCredits(user.maxCredits);
  };

  const handleAdjustCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSaving(true);
    try {
      const response = await axios.post("/api/admin/adjust-credits", {
        userId: editingUser.id,
        credits: newCredits,
        maxCredits: newMaxCredits,
      });

      if (response.data.success) {
        toast.success(`Updated credits for ${editingUser.email}`);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id ? { ...u, credits: newCredits, maxCredits: newMaxCredits } : u
          )
        );
        setEditingUser(null);
      } else {
        toast.error("Failed to update credits");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const getTierBadgeClass = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "pro":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "growth":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      case "starter":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs list */}
      <div className="flex border-b border-zinc-800 gap-6">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 pb-4 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "users"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <UserCog size={16} />
          Users Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 pb-4 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "logs"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Cpu size={16} />
          Generation Logs ({logs.length})
        </button>
      </div>

      {/* Users directory panel */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            {/* Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Tiers</option>
              <option value="free">Free Tier</option>
              <option value="starter">Starter Pack</option>
              <option value="growth">Growth Pack</option>
              <option value="pro">Pro Plan</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300 border-collapse">
                <thead className="bg-zinc-950 text-zinc-400 text-xs font-semibold uppercase border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-6 py-4">Plan / Tier</th>
                    <th className="px-6 py-4 text-center">Remaining Credits</th>
                    <th className="px-6 py-4 text-center">Max Credits</th>
                    <th className="px-6 py-4 text-center">Projects</th>
                    <th className="px-6 py-4">Last Generation</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-900/50 transition">
                        <td className="px-6 py-4.5">
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-xs text-zinc-400 select-all">{u.email}</div>
                          {u.clerkId && (
                            <div className="text-[10px] text-zinc-600 mt-0.5 font-mono select-all">
                              ID: {u.clerkId}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${getTierBadgeClass(u.tier)}`}>
                            {u.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center font-mono text-white font-semibold">
                          {u.tier.toLowerCase() === "pro" ? "∞" : u.credits}
                        </td>
                        <td className="px-6 py-4.5 text-center font-mono text-zinc-400">
                          {u.tier.toLowerCase() === "pro" ? "∞" : u.maxCredits}
                        </td>
                        <td className="px-6 py-4.5 text-center font-semibold text-zinc-200">
                          {u.projectCount}
                        </td>
                        <td className="px-6 py-4.5 text-xs text-zinc-400">
                          {u.lastActive ? (
                            new Date(u.lastActive).toLocaleString(undefined, {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          ) : (
                            <span className="text-zinc-600">Never active</span>
                          )}
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button
                            onClick={() => openAdjustDialog(u)}
                            className="bg-zinc-850 hover:bg-blue-600/20 hover:text-blue-400 text-zinc-300 border border-zinc-700/60 hover:border-blue-500/30 p-2 rounded-xl transition"
                            title="Adjust user credits"
                          >
                            <UserCog size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-zinc-500">
                        No users matching your filters were found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Logs directory panel */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          {/* Logs search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              placeholder="Search logs by email, model, or mode..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Logs Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300 border-collapse">
                <thead className="bg-zinc-950 text-zinc-400 text-xs font-semibold uppercase border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">User Email</th>
                    <th className="px-6 py-4">Model Used</th>
                    <th className="px-6 py-4 text-center">Duration</th>
                    <th className="px-6 py-4 text-center">Prompt / Comp. Tokens</th>
                    <th className="px-6 py-4 text-center">Mode</th>
                    <th className="px-6 py-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((l) => (
                      <tr key={l.id} className="hover:bg-zinc-900/50 transition">
                        <td className="px-6 py-4 font-medium text-white select-all">{l.email}</td>
                        <td className="px-6 py-4 text-xs font-mono text-zinc-400">{l.model}</td>
                        <td className="px-6 py-4 text-center font-mono">
                          {l.durationMs !== null ? `${(l.durationMs / 1000).toFixed(2)}s` : "-"}
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-xs text-zinc-400">
                          {l.promptTokens !== null || l.completionTokens !== null ? (
                            <span>
                              {l.promptTokens || 0} / {l.completionTokens || 0}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-xs font-mono">
                            {l.mode || "unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-400">
                          {l.createdOn ? (
                            new Date(l.createdOn).toLocaleString(undefined, {
                              dateStyle: "short",
                              timeStyle: "medium",
                            })
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">
                        No logs matching your filters were found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Credit Adjustment Dialog Overlay */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 text-blue-400">
              <ShieldAlert size={20} />
              <h3 className="font-bold text-lg text-white">Adjust Allocations</h3>
            </div>

            <p className="text-sm text-zinc-400 mb-5">
              Modify the credit balance for <span className="font-semibold text-zinc-200 select-all">{editingUser.email}</span>.
            </p>

            <form onSubmit={handleAdjustCredits} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Tier / Plan
                </label>
                <input
                  type="text"
                  value={editingUser.tier.toUpperCase()}
                  disabled
                  className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl px-4 py-2 text-sm text-zinc-500 cursor-not-allowed font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Current Balance
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCredits}
                    onChange={(e) => setNewCredits(parseInt(e.target.value) || 0)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Max Allocations
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newMaxCredits}
                    onChange={(e) => setNewMaxCredits(parseInt(e.target.value) || 0)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-sm font-semibold px-4 py-2.5 rounded-xl transition border border-zinc-700/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-600/10"
                >
                  {isSaving && <RefreshCw size={14} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
