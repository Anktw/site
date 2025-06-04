import { getProjects } from "@/lib/projects"
import { ArrowUpRight } from "lucide-react"

export default async function RecentProjects() {
  const projects = await getProjects();

  if (!projects || projects.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <section className="mb-16">
      {projects.map((project) => (
        <div key={project.id} className="group">
          <div className="flex items-center justify-between py-3 px-4 -mx-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.desc}</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors ml-4" />
          </div>
        </div>
      ))}
    </section>
  );
}