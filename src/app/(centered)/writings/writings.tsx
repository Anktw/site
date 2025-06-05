import { getWritings } from "@/lib/AllWritings"
import { ArrowUpRight, Calendar } from "lucide-react"
import Link from "next/link";

export default async function Writings() {
    const writings = await getWritings();

    if (!writings || writings.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <section className="mb-16">
            {writings.map((writing) => (
                <Link key={writing.id} href={`/writings/${writing.title.replace(/\s+/g, '-')}`} className="block group">
                    <div className="flex items-center justify-between py-3 px-4 -mx-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                                {writing.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{writing.desc}</p>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mt-2">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(writing.date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors ml-4" />
                    </div>
                </Link>
            ))}
        </section>
    );
}