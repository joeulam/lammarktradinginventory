import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "bagge",
  description: "Joey's Inventory system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        
      >
        {children}
      </body>
    </html>
  );
}
