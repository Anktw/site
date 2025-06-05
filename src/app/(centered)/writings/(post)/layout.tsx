import { unstable_ViewTransition as ViewTransition } from 'react'
import { getWritings } from '@/lib/AllWritings';
import ClientHeaderWrapper from './clientHeaderWrapper';

export const revalidate = 3600;

export default async function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const writings = await getWritings();

    return (
        <div>
            <ClientHeaderWrapper writings={writings} />
            <ViewTransition>{children}</ViewTransition>
        </div>
    )
}