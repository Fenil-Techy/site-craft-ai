import { TooltipProvider } from "@/components/ui/tooltip"
import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/ui/themes'
import Script from "next/script";
import "./globals.css";
import Provider from "./provider";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

const GA_ID = "G-LE6LDNG9NZ";

export const metadata: Metadata = {
  title: {
    default: "CraftPortfolio — AI Portfolio Builder",
    template: "%s | CraftPortfolio",
  },
  description:
    "Generate a stunning, professional portfolio website in seconds with AI. Describe your skills and let CraftPortfolio build a premium, recruiter-ready site instantly.",
  keywords: [
    "AI portfolio builder",
    "portfolio generator",
    "AI website builder",
    "developer portfolio",
    "professional portfolio",
    "portfolio maker",
    "resume website builder",
    "CraftPortfolio",
    "free portfolio builder",
    "online portfolio creator",
  ],
  authors: [{ name: "CraftPortfolio" }],
  creator: "CraftPortfolio",
  publisher: "CraftPortfolio",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.craftportfolio.online",
  },
  openGraph: {
    title: "CraftPortfolio — AI Portfolio Builder",
    description:
      "Generate a stunning, professional portfolio website in seconds with AI. Build a recruiter-ready portfolio site in seconds.",
    url: "https://www.craftportfolio.online",
    siteName: "CraftPortfolio",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://www.craftportfolio.online/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "CraftPortfolio – AI Portfolio Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CraftPortfolio — AI Portfolio Builder",
    description:
      "Generate a stunning, professional portfolio website in seconds with AI.",
    images: ["https://www.craftportfolio.online/android-chrome-512x512.png"],
  },
  metadataBase: new URL("https://www.craftportfolio.online"),
  verification: {
    google: undefined, // Add Google Search Console verification token here when available
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased" style={{backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)'}}>
      {/* Google Analytics 4 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { page_path: window.location.pathname });
        `}
      </Script>
      {/* JSON-LD Structured Data */}
      <Script id="json-ld-org" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "CraftPortfolio",
          "url": "https://www.craftportfolio.online",
          "description": "Generate a stunning, professional portfolio website in seconds with AI.",
          "applicationCategory": "DesignApplication",
          "operatingSystem": "All",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        })}
      </Script>
      <ClerkProvider
    appearance={{
    theme: dark,
    variables: {
      colorPrimary: '#fbbf24',
      colorBackground: '#0d0d0d',
      colorForeground: '#fafaf9',
      colorMutedForeground: '#a8a29e',
      colorNeutral: '#1c1c1c',
      borderRadius: '8px',
    },
    elements: {
      card:
        "bg-[#141414] border border-white/6 shadow-xl backdrop-blur-md",
      headerTitle: "text-[#fafaf9] font-semibold",
      headerSubtitle: "text-[#a8a29e]",
      formFieldLabel: "text-[#a8a29e] font-medium text-sm",
      footerActionText: "text-[#a8a29e]",
      footerActionLink: "text-[#fbbf24] hover:text-[#fcd34d]",
      formFieldInput:
        "bg-[#0d0d0d] border border-white/6 text-[#fafaf9] focus:border-[#fbbf24] rounded-lg",
      socialButtonsBlockButton:
        "bg-[#1c1c1c] border border-white/6 hover:bg-[#262626] hover:border-[#fbbf24]/30 transition-all duration-200",
      socialButtonsBlockButtonText: "!text-[#fafaf9] font-medium",
      dividerLine: "bg-white/6",
      dividerText: "text-[#57534e] font-medium text-xs tracking-wider uppercase",
      userButtonPopoverCard:
        "bg-[#141414] border border-white/6 shadow-lg",
      userButtonPopoverActionButton:
        "text-[#fafaf9] !text-[#fafaf9] hover:bg-[#fbbf24]/10 transition-colors",
      userButtonPopoverActionButtonText: "text-[#fafaf9] !text-[#fafaf9] font-medium",
      userButtonPopoverActionButtonIcon: "text-[#fafaf9] !text-[#fafaf9] opacity-70",
      userButtonPopoverFooter:
        "bg-[#0d0d0d] border-t border-white/6",
      formButtonPrimary:
        "bg-[#fbbf24] hover:bg-[#fcd34d] text-[#0d0d0d] font-semibold shadow-lg transition-all active:scale-[0.98]",
    },
  }}
>
          <Provider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </Provider>
        </ClerkProvider>
  <Analytics/>
  <SpeedInsights/>
      </body>
    </html>
  )
}