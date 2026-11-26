import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://kongu-ai-academy.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Kongu AI Academy — AI, Machine Learning & Data Science Training in Coimbatore", template: "%s · Kongu AI Academy" },
  description:
    "Practical AI, Machine Learning, Python, Data Science, Generative AI and Power BI training in Coimbatore, Tamil Nadu. 25 hands-on Google Colab labs with real datasets, college workshops and faculty development programmes.",
  keywords: ["AI training Coimbatore", "Artificial Intelligence training Tamil Nadu", "Machine Learning training", "Python training", "Data Science training", "AI workshops for colleges", "Faculty Development Programme", "Generative AI training", "Power BI training"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", url: SITE, siteName: "Kongu AI Academy",
    title: "Kongu AI Academy — Build Your Future in Artificial Intelligence",
    description: "Hands-on AI, ML and Data Science training with 25 Colab labs and real datasets. Coimbatore, Tamil Nadu.",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: "Kongu AI Academy", description: "Learn AI. Build Intelligence. Shape Tomorrow." },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#070B18", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Sora:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-madder focus:px-4 focus:py-2">Skip to content</a>
        <Nav />
        <main id="main" className="flex-1 pt-[68px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
