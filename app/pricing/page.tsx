'use client'
import React, { useState } from 'react'
import Header from '../_components/Header'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, Loader2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { useUser, SignInButton } from '@clerk/nextjs'
import Script from 'next/script'

const PLANS = [
  {
    id: "free",
    name: "Free Plan",
    price: "0",
    period: "lifetime",
    description: "Get started with basic portfolio generation.",
    credits: "2 Credits",
    features: [
      "2 portfolio generations/edits",
      "Gemma 4 basic model access",
      "Standard generation queue",
      "Includes CraftPortfolio watermark",
    ],
    buttonText: "Current Tier",
    popular: false,
    gradient: "from-zinc-900 to-zinc-950",
    borderClass: "border-zinc-800",
  },
  {
    id: "starter",
    name: "Starter Pack",
    price: "799",
    period: "one-time",
    description: "For professionals needing additional generations.",
    credits: "50 Credits",
    features: [
      "50 portfolio generations/edits",
      "Gemma 4 basic model access",
      "Standard generation queue",
      "Includes CraftPortfolio watermark",
      "Credits never expire",
    ],
    buttonText: "Buy Starter Pack",
    popular: false,
    gradient: "from-blue-950/40 to-zinc-900/60",
    borderClass: "border-blue-500/20",
  },
  {
    id: "growth",
    name: "Growth Pack",
    price: "2,499",
    period: "one-time",
    description: "Great value for designers and power creators.",
    credits: "200 Credits",
    features: [
      "200 portfolio generations/edits",
      "Gemma 4 basic model access",
      "Standard generation queue",
      "Includes CraftPortfolio watermark",
      "Credits never expire",
    ],
    buttonText: "Buy Growth Pack",
    popular: true,
    gradient: "from-purple-950/40 to-zinc-900/60",
    borderClass: "border-purple-500/40 shadow-purple-500/5",
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: "1,499",
    period: "monthly",
    description: "Full professional suite with premium models and white-labeling.",
    credits: "Unlimited Credits",
    features: [
      "Unlimited portfolio generations",
      "Qwen 3 Premium model (235B)",
      "Priority generation queue",
      "Strict white-labeling (No watermark)",
      "Cancel subscription anytime",
    ],
    buttonText: "Subscribe to Pro",
    popular: false,
    gradient: "from-amber-950/40 to-zinc-900/60",
    borderClass: "border-amber-500/30",
  },
];

function Pricing() {
  const { user, isLoaded } = useUser();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    if (planId === "free") return;
    if (!user) {
      toast.error("Please sign in to proceed with checkout.");
      return;
    }

    if (!(window as any).Razorpay) {
      toast.error("Razorpay SDK failed to load. Please refresh and try again.");
      return;
    }

    try {
      setLoadingId(planId);
      
      // 1. Create Order/Subscription Session in Backend
      const res = await axios.post("/api/razorpay/order", { tier: planId });
      const { id, amount, currency, keyId, type } = res.data;

      // 2. Open Razorpay Modal with custom handlers
      const options: any = {
        key: keyId,
        name: "CraftPortfolio",
        description: planId === "pro" ? "Pro Plan (Subscription)" : `${planId.toUpperCase()} Credit Pack`,
        prefill: {
          name: user.fullName || "",
          email: user.primaryEmailAddress?.emailAddress || "",
        },
        theme: {
          color: planId === "pro" ? "#F59E0B" : planId === "growth" ? "#8B5CF6" : "#3B82F6",
        },
        handler: async function (response: any) {
          try {
            setLoadingId(planId);
            toast.info("Verifying payment signature...");

            const payload: any = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              tier: planId,
            };

            if (type === "subscription") {
              payload.razorpay_subscription_id = response.razorpay_subscription_id;
            } else {
              payload.razorpay_order_id = response.razorpay_order_id;
              payload.credits = planId === "starter" ? "50" : "200";
            }

            // 3. Post parameters back to endpoint for secure verification
            const verifyRes = await axios.post("/api/razorpay/verify", payload);
            if (verifyRes.data.success) {
              toast.success("Payment verified! Account upgraded successfully.");
              // Force window reload to workspace to refresh UserDetailContext state
              window.location.href = "/workspace";
            } else {
              toast.error("Signature verification failed.");
            }
          } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || "Signature verification failed.");
          } finally {
            setLoadingId(null);
          }
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment modal cancelled.");
            setLoadingId(null);
          }
        }
      };

      if (type === "subscription") {
        options.subscription_id = id;
      } else {
        options.order_id = id;
        options.amount = amount;
        options.currency = currency;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to start payment process.");
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="beforeInteractive" 
      />
      <Header />
      <main className="relative flex flex-col items-center justify-center w-full px-4 sm:px-6 py-12 text-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[500px] sm:h-[800px] sm:w-[800px] rounded-full bg-blue-500/10 opacity-30 blur-3xl pointer-events-none -z-10" />
        <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-purple-500/10 opacity-30 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl w-full mx-auto space-y-4">
          <div className="space-y-2">
            <h2 className="font-extrabold text-3xl sm:text-4xl tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
              Flexible Credits & Plans
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
              Get one-time credit packages or upgrade to Pro to unlock premium models and remove watermark attributions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between p-6 rounded-3xl bg-gradient-to-b ${plan.gradient} border ${plan.borderClass} transition-all duration-300 hover:scale-[1.02] hover:border-zinc-700/60 shadow-lg`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Most Popular
                  </span>
                )}

                <div>
                  <div className="space-y-1 text-left">
                    <h3 className="font-bold text-lg text-white">{plan.name}</h3>
                    <p className="text-xs text-zinc-400 leading-snug min-h-[32px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="my-6 text-left space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">₹{plan.price}</span>
                      <span className="text-zinc-500 text-xs">/ {plan.period}</span>
                    </div>
                    <span className="inline-block text-[11px] bg-white/10 text-white font-semibold px-2 py-0.5 rounded-md">
                      {plan.credits}
                    </span>
                  </div>

                  <div className="border-t border-zinc-800/60 pt-4 text-left">
                    <ul className="space-y-2.5 text-xs text-zinc-300">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8">
                  {plan.id === "free" ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl py-5 border-zinc-800 text-zinc-400 bg-transparent cursor-default"
                      disabled
                    >
                      {plan.buttonText}
                    </Button>
                  ) : !isLoaded ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl py-5 border-zinc-800 text-zinc-400"
                      disabled
                    >
                      Loading...
                    </Button>
                  ) : !user ? (
                    <SignInButton mode="modal" forceRedirectUrl="/pricing">
                      <Button className="w-full rounded-xl py-5 bg-white text-black hover:bg-zinc-200">
                        Sign In to Purchase
                      </Button>
                    </SignInButton>
                  ) : (
                    <Button
                      onClick={() => handleCheckout(plan.id)}
                      disabled={loadingId !== null}
                      className={`w-full rounded-xl py-5 font-bold transition-all ${
                        plan.popular
                          ? "bg-purple-600 text-white hover:bg-purple-500"
                          : "bg-white text-black hover:bg-zinc-200"
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
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Pricing;