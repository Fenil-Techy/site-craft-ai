import { AI_MODELS } from "./models";

/**
 * Gating checks for premium plans and features.
 */

export function isModelAllowed(tier: string | null | undefined, modelId: string): boolean {
  const userTier = tier?.toLowerCase() || "free";
  if (userTier === "pro") return true;

  const modelConfig = AI_MODELS.find((m) => m.id === modelId);
  if (modelConfig?.premium) {
    return false;
  }

  return true;
}

export function canUseFeature(tier: string | null | undefined, feature: string): boolean {
  const userTier = tier?.toLowerCase() || "free";
  if (userTier === "pro") return true;

  // Gate premium features
  const premiumFeatures = ["multi_frame", "custom_domain", "priority_queue"];
  if (premiumFeatures.includes(feature)) {
    return false;
  }

  return true;
}
