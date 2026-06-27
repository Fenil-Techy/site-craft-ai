'use client'
import React, { useState } from 'react'
import Header from '../_components/Header'
import { Button } from '@/components/ui/button'
import { Check, Zap, Crown, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useUser, SignInButton } from '@clerk/nextjs'
import Script from 'next/script'

const PLANS = [
  {
    id: "test",
    name: "Test ₹1",
    price: "1",
    period: "one-time",
    description: "For live payment testing only.",
    credits: 1,
    icon: Zap,
    iconColor: "text-emerald-400",
    features: [
      "1 credit (test only)",
      "Verifies full payment flow",
      "Not for production use",
    ],
    buttonText: "Pay ₹1 to Test",
    gradient: "from-emerald-950/40 to-zinc-950",
    borderClass: "border-emerald-500/30 border-dashed",
    accentColor: "bg-emerald-700",
    popular: false,
  },
  {
    id: "free",
    name: "Free",
    price: "0",
    period: "forever",
    description: "Try it out. No card needed.",
    credits: 2,
    icon: Zap,
    iconColor: "text-zinc-400",
    features: [
      "2 portfolio generations",
      "Watermark on output",
      "Basic AI model",
      "No live editor",
      "One-time chat update",
    ],
    buttonText: "Current Plan",
    gradient: "from-zinc-900 to-zinc-950",
    borderClass: "border-zinc-800",
    accentColor: "bg-zinc-700",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "799",
    period: "one-time",
    description: "For creators who need more generations.",
    credits: 50,
    icon: Sparkles,
    iconColor: "text-blue-400",
    features: [
      "50 portfolio generations",
      "Watermark on output",
      "All AI models",
      "Live editor",
      "Priority support",
    ],
    buttonText: "Get Pro",
    gradient: "from-blue-950/50 to-zinc-950",
    borderClass: "border-blue-500/30",
    accentColor: "bg-blue-600",
    popular: false,
  },
  {
    id: "elite",
    name: "Elite",
    price: "2,499",
    period: "one-time",
    description: "White-label quality. Zero compromise.",
    credits: 200,
    icon: Crown,
    iconColor: "text-purple-400",
    features: [
      "200 portfolio generations",
      "No watermark",
      "All AI models",
      "Live editor",
      "Priority support",
    ],
    buttonText: "Get Elite",
    gradient: "from-purple-950/50 to-zinc-950",
    borderClass: "border-purple-500/40",
    accentColor: "bg-purple-600",
    popular: true,
  },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

function Pricing() {
  const { user, isLoaded } = useUser();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    if (planId === "free") return;

    if (!user) {
      toast.error("Please sign in to continue.");
      return;
    }

    if (!window.Razorpay) {
      toast.error("Payment SDK not loaded. Please refresh and try again.");
      return;
    }

    try {
      setLoadingId(planId);

      // Step 1: Create order on backend
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create order");
      }

      const { order_id, amount, currency } = await res.json();

      const plan = PLANS.find((p) => p.id === planId)!;

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id,
        amount,
        currency,
        name: "CraftPortfolio",
        description: `${plan.name} Plan — ${plan.credits} Credits`,
        prefill: {
          name: user.fullName || "",
          email: user.primaryEmailAddress?.emailAddress || "",
        },
        theme: {
          color: planId === "elite" ? "#9333ea" : "#3b82f6",
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            setLoadingId(planId);
            toast.loading("Verifying payment...", { id: "verify" });

            // Step 3: Verify signature on backend
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan: planId,
              }),
            });

            toast.dismiss("verify");

            if (!verifyRes.ok) {
              const err = await verifyRes.json();
              throw new Error(err.error || "Verification failed");
            }

            toast.success(`🎉 ${plan.name} plan activated! ${plan.credits} credits added.`);
            setTimeout(() => { window.location.href = "/workspace"; }, 1500);
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed.");
            setLoadingId(null);
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled.");
            setLoadingId(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoadingId(null);
      });
      rzp.open();

    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Pre-initialize Razorpay as soon as checkout.js loads.
          // This triggers background device fingerprinting (UPI app detection)
          // so all payment options are ready before the user clicks Pay.
          if (typeof window !== "undefined" && window.Razorpay) {
            try {
              const prefetchInstance = new window.Razorpay({
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
              });
              // Trigger internal prefetch / UPI app detection silently
              if (typeof prefetchInstance.prefetch === "function") {
                prefetchInstance.prefetch();
              }
            } catch {
              // Silently ignore — prefetch is best-effort
            }
          }
        }}
      />
      <Header />
      <main className="relative flex flex-col items-center justify-center w-full px-4 sm:px-6 py-16 text-center overflow-hidden">
        {/* Background glows */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-blue-500/8 blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-purple-500/8 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl w-full mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-3">
            <h1 className="font-extrabold text-4xl sm:text-5xl tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Simple Pricing
            </h1>
            <p className="text-zinc-400 text-base max-w-md mx-auto">
              Pay once, use forever. No subscriptions, no surprises.
            </p>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b ${plan.gradient} border ${plan.borderClass} transition-all duration-300 hover:scale-[1.02] shadow-xl`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                      <Sparkles className="h-3 w-3" /> Most Popular
                    </span>
                  )}

                  <div className="space-y-6">
                    {/* Plan header */}
                    <div className="flex items-center gap-3 text-left">
                      <div className={`p-2 rounded-xl bg-white/5`}>
                        <Icon className={`h-5 w-5 ${plan.iconColor}`} />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg text-white">{plan.name}</h2>
                        <p className="text-xs text-zinc-500">{plan.description}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-left">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-white">₹{plan.price}</span>
                        <span className="text-zinc-500 text-sm">/ {plan.period}</span>
                      </div>
                      <span className={`inline-block mt-2 text-xs font-semibold text-white px-2.5 py-1 rounded-lg ${plan.accentColor}`}>
                        {plan.credits === 2 ? "2 Credits" : `${plan.credits} Credits`}
                      </span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 text-left">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="mt-8">
                    {plan.id === "free" ? (
                      <Button
                        variant="outline"
                        className="w-full rounded-xl py-5 border-zinc-700 text-zinc-500 bg-transparent cursor-default"
                        disabled
                      >
                        {plan.buttonText}
                      </Button>
                    ) : !isLoaded ? (
                      <Button className="w-full rounded-xl py-5" disabled>
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </Button>
                    ) : !user ? (
                      <SignInButton mode="modal" forceRedirectUrl="/pricing">
                        <Button className="w-full rounded-xl py-5 bg-white text-black hover:bg-zinc-200 font-semibold">
                          Sign In to Purchase
                        </Button>
                      </SignInButton>
                    ) : (
                      <Button
                        onClick={() => handleCheckout(plan.id)}
                        disabled={loadingId !== null}
                        className={`w-full rounded-xl py-5 font-semibold transition-all ${
                          plan.id === "elite"
                            ? "bg-purple-600 hover:bg-purple-500 text-white"
                            : plan.id === "test"
                            ? "bg-emerald-700 hover:bg-emerald-600 text-white"
                            : "bg-blue-600 hover:bg-blue-500 text-white"
                        }`}
                      >
                        {loadingId === plan.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          plan.buttonText
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <p className="text-zinc-600 text-xs">
            Payments are processed securely by Razorpay. Credits never expire.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Pricing;