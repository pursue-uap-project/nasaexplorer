import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import PWARegistration from "@/components/PWARegistration";
import "@/app/globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
 });

export const metadata: Metadata = {
  openGraph: { type: "website", images: ["https://pursue-uap-project.github.io/nasaexplorer/og.png"] },
  twitter: { card: "summary_large_image", images: ["https://pursue-uap-project.github.io/nasaexplorer/og.png"] },
  title: "NASA Explorer",
  description: "Interactive explorer of NASA missions, the solar system, and the cosmos",
  manifest: "/manifest.json",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "es")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={montserrat.variable}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <PWARegistration />
          <Navbar />
          <PageTransition>
            {children}
          </PageTransition>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
