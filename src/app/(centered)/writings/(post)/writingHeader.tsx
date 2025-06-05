import { Writings } from "@/lib/AllWritings";
import { Calendar } from "lucide-react";

export default function WritingHeader({ 
    writings,
    slug 
}: { 
    writings: Writings[];
    slug: string;
}) {
    const writing = writings.find(
        (w: Writings) => w.title.replace(/\s+/g, '-').toLowerCase() === slug.toLowerCase()
    );
    if (!writing) {
        return null;
    }
    
    return (
        <header className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {writing.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                {writing.desc}
            </p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(writing.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })}
            </div>
        </header>
    );
}