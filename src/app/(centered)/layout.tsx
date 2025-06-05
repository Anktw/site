import {unstable_ViewTransition as ViewTransition} from 'react'

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between pt-0 md:pt-8 p-8">
      <main className="max-w-[60ch] mx-auto w-full space-y-6 mt-16">
        <ViewTransition>{children}</ViewTransition>
      </main>
    </div>
  )
}
