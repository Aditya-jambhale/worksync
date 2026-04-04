export const metadata = {
    title: {
      default: "WorkSync | The Modern Workforce Operating System",
      template: "%s | WorkSync"
    },
    description: "Enterprise-grade work tracking, shift management, and performance analytics. Designed for high-performance teams. WorkSync is the modern operating system for the distributed workforce.",
    applicationName: "WorkSync",
    authors: [{ name: "WorkSync Engineering", url: "https://worksync.core" }],
    generator: "Next.js",
    keywords: ["workforce management", "shift tracking", "productivity analytics", "employee portal", "SaaS dashboard", "work tracking", "linear alternative", "stripe for work"],
    referrer: "origin-when-cross-origin",
    creator: "WorkSync Core Team",
    publisher: "WorkSync",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL("https://worksync.core"),
    alternates: {
      canonical: "/",
      languages: {
        "en-US": "/en-US",
      },
    },
    openGraph: {
      title: "WorkSync | High-Performance Workforce OS",
      description: "Manage shifts, track performance, and sync with your team's operational core. The modern hub for distributed excellence.",
      url: "https://worksync.core/dashboard",
      siteName: "WorkSync",
      images: [
        {
          url: "https://worksync.core/og-image.png",
          width: 1200,
          height: 630,
          alt: "WorkSync Dashboard Overhaul",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "WorkSync | SaaS Productivity for Modern Teams",
      description: "Enterprise shift management and high-fidelity work tracking. Designed for teams that prioritize focus and output.",
      site: "@WorkSyncCore",
      creator: "@WorkSyncCore",
      images: ["https://worksync.core/twitter-image.png"],
    },
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
    icons: {
      icon: [
        { url: "/logo.png" },
        { url: "/logo.png", sizes: "192x192", type: "image/png" },
        { url: "/logo.png", sizes: "512x512", type: "image/png" },
      ],
      shortcut: ["/logo.png"],
      apple: [
        { url: "/logo.png" },
      ],
      other: [
        {
          rel: "apple-touch-icon-precomposed",
          url: "/logo.png",
        },
      ],
    },
    manifest: "/manifest.json",
  };

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};