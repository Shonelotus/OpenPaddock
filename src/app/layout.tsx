import "./css/globals.css";

export const metadata = {
  title: 'OnlyF1',
  description: 'Your F1 Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
