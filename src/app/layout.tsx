import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "祥瑞マネジメントOS | 株式会社祥瑞",
  description: "株式会社祥瑞 社内マネジメントプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-serif antialiased" style={{ fontFamily: "'Noto Serif JP', serif" }}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
