export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="max-w-[60ch] mx-auto w-full space-y-6">
        {children}
    </main>
  )
}
