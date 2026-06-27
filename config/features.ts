import { AI_MODELS } from "./models";

/**
 * Tier hierarchy: free < pro < elite
 * Both 'pro' and 'elite' are "upgraded" tiers.
 */

/** Returns true for any paid/upgraded tier (pro OR elite). */
export function isUpgradedTier(tier: string | null | undefined): boolean {
  const t = tier?.toLowerCase() || "free";
  return t === "pro" || t === "elite";
}

/** Elite tier removes the watermark; free and pro keep it. */
export function hasWatermark(tier: string | null | undefined): boolean {
  const t = tier?.toLowerCase() || "free";
  return t !== "elite";
}

/** Pro and Elite can send unlimited chat messages; free gets one. */
export function hasUnlimitedChat(tier: string | null | undefined): boolean {
  return isUpgradedTier(tier);
}

/** Model gating: upgraded tiers can use premium models. */
export function isModelAllowed(tier: string | null | undefined, modelId: string): boolean {
  if (isUpgradedTier(tier)) return true;

  const modelConfig = AI_MODELS.find((m) => m.id === modelId);
  if (modelConfig?.premium) return false;

  return true;
}

/** Legacy alias kept for any existing callers. */
export function canUseFeature(tier: string | null | undefined, feature: string): boolean {
  if (isUpgradedTier(tier)) return true;

  const premiumFeatures = ["multi_frame", "custom_domain", "priority_queue"];
  if (premiumFeatures.includes(feature)) return false;

  return true;
}
