import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

// Configure DM Sans for primary text and UI elements
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Configure DM Mono for data, IDs, and confidence scores
const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "QuickAlert | Emergency Response System",
  description: "Real-time emergency reporting, AI verification, and responder dispatch system.",
  icons: {
    icon: "/favicon.ico", // Ensure you have an icon in your public folder
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmMono.variable} h-full antialiased`}
      style={{ backgroundColor: "#0C0C0C" }} // Matches the project's --bg variable
    >
      <body className="min-h-full flex flex-col selection:bg-red-500/30">
        {children}
      </body>
    </html>
  );
}