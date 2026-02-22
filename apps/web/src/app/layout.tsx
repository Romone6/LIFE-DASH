import "../styles/globals.css";

export const metadata = {
  title: "LifeOS",
  description: "LifeOS AI Lab Console"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
