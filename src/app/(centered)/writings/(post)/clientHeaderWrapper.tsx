"use client";

import { usePathname } from 'next/navigation';
import WritingHeader from './writingHeader';
import { Writings } from '@/lib/AllWritings';

export default function ClientHeaderWrapper({ writings }: { writings: Writings[] }) {
    const pathname = usePathname();
    const slug = pathname.split('/').pop() || '';
    
    return <WritingHeader writings={writings} slug={slug} />;
}
