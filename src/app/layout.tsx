import "~/styles/globals.css";
import { type Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { TRPCReactProvider } from "~/trpc/react";
import AuthProvider from './auth-provider';
import { Header } from './_components/Header';

export const metadata: Metadata = {
  title: "AI-Powered RPL Platform",
  description: "Get certified for your real-world skills.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <AuthProvider>
          <TRPCReactProvider>
            <Header />
            <main>{children}</main>
          </TRPCReactProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
