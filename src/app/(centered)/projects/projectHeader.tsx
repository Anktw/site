/* eslint-disable @typescript-eslint/no-explicit-any */
import { A } from "@/components/mdx/a";
import { Projects } from "@/lib/AllProjects";

// simple slugify helper
function slugify(text: string) {
    return text
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')        // spaces -> -
        .replace(/[^a-z0-9-]/g, ''); // remove invalid chars
}

export default function ProjectHeader({
    projects,
    slug
}: {
    projects: Projects[];
    slug: string;
}) {
    const project = projects.find((p: Projects) => {
        // prefer an explicit slug if present, otherwise compute from title
        const pSlug = (p as any).slug ? (p as any).slug : slugify((p as any).title);
        return pSlug.toLowerCase() === slug.toLowerCase();
    });

    if (!project) {
        return null;
    }
    return (
        <header className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {project.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                {project.desc}
            </p>
            <div className="flex items-center gap-3 w-full">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                    <A href={project.github}>Github</A>
                </div>
                {project.livelink && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                        <A href={project.livelink}>Live Link</A>
                    </div>
                )}
                {project.download &&(
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                        <A href={project.download}>Download this {project.filetype}</A>
                    </div>
                )}
            </div>
        </header>
    );
}