import { unstable_ViewTransition as ViewTransition } from 'react'
import { getProjects} from '@/lib/AllProjects';
import ClientHeaderWrapper from './clientHeaderWrapper';

export const revalidate = 3600;

export default async function ProjectLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const projects = await getProjects();

    return (
        <div>
            <ClientHeaderWrapper projects={projects} />
            <ViewTransition>{children}</ViewTransition>
        </div>
    )
}