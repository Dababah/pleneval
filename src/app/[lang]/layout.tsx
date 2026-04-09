import type { Metadata } from "next";
import type { Locale } from "@/i18n-config";
import { Inter, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./../globals.css";
import { AuthProvider } from "@/components/Providers";
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans"
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading"
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta"
});

export const metadata: Metadata = {
  title: "Plen | Modern Platform",
  description: "Advanced productivity and planning platform",
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { children } = props;
  const params = await props.params;
  const lang = params.lang as Locale;

  return (
    <html lang={lang}>
      <body className={`${inter.variable} ${outfit.variable} ${jakarta.variable} antialiased`}>
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
