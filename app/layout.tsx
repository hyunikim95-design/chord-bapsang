import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PWAInstallPrompt } from "../components/PWAInstallPrompt";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "코드밥상",
  title: "코드밥상",
  description: "화성 진행을 만들고 바로 연습하는 기타 코드 트레이닝 앱",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "코드밥상",
  },
  icons: {
    icon: "/icons/chord-bapsang-icon.svg",
    apple: "/icons/chord-bapsang-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#02040A",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
