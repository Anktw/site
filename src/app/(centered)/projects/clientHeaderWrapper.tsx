"use client";

import { usePathname } from 'next/navigation';
import ProjectHeader from './projectHeader';
import { Projects } from '@/lib/AllProjects';

export default function ClientHeaderWrapper({ projects }: { projects: Projects[] }) {
    const pathname = usePathname();
    const slug = pathname.split('/').pop() || '';

    return <ProjectHeader projects={projects} slug={slug} />;
}
