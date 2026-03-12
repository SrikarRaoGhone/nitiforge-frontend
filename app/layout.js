import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "NitiForge CRM",
  description: "Modern CRM workspace for lead intelligence",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full overflow-hidden antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
