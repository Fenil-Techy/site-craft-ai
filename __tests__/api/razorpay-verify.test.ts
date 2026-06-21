import { describe, it, expect } from "vitest";
import crypto from "crypto";

// Verification logic used in checkout callback verification (/api/razorpay/verify)
function verifyCheckoutSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  return expectedSignature === signature;
}

// Verification logic used in webhook listener (/api/webhooks/razorpay)
function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

describe("Razorpay Signature Verification", () => {
  const secret = "test_webhook_secret_key_123456";

  describe("Checkout Signature Verification", () => {
    const orderId = "order_O1A2B3C4D5";
    const paymentId = "pay_P1Q2R3S4T5";

    it("should verify successfully with a valid signature", () => {
      const validSignature = crypto
        .createHmac("sha256", secret)
        .update(orderId + "|" + paymentId)
        .digest("hex");

      const isValid = verifyCheckoutSignature(orderId, paymentId, validSignature, secret);
      expect(isValid).toBe(true);
    });

    it("should fail to verify if signature does not match", () => {
      const invalidSignature = "incorrect_signature_hash_value";
      const isValid = verifyCheckoutSignature(orderId, paymentId, invalidSignature, secret);
      expect(isValid).toBe(false);
    });

    it("should fail to verify if orderId or paymentId is tampered with", () => {
      const validSignature = crypto
        .createHmac("sha256", secret)
        .update(orderId + "|" + paymentId)
        .digest("hex");

      const tamperedOrderId = "order_O1A2B3C4D5_altered";
      const isValid = verifyCheckoutSignature(tamperedOrderId, paymentId, validSignature, secret);
      expect(isValid).toBe(false);
    });
  });

  describe("Webhook Signature Verification", () => {
    const webhookPayload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_xyz789",
            amount: 5000,
            notes: { userId: "42" },
          },
        },
      },
    });

    it("should verify successfully with a valid webhook signature", () => {
      const validSignature = crypto
        .createHmac("sha256", secret)
        .update(webhookPayload)
        .digest("hex");

      const isValid = verifyWebhookSignature(webhookPayload, validSignature, secret);
      expect(isValid).toBe(true);
    });

    it("should fail if webhook body payload has been altered", () => {
      const validSignature = crypto
        .createHmac("sha256", secret)
        .update(webhookPayload)
        .digest("hex");

      const alteredPayload = webhookPayload + " "; // Trailing space
      const isValid = verifyWebhookSignature(alteredPayload, validSignature, secret);
      expect(isValid).toBe(false);
    });
  });
});
