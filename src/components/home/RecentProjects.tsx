import React from 'react';

type Project = {
  id: number;
  title: string;
  desc: string;
  livelink: string;
  github: string;
  filetype?: string;
  download?: string;
};

async function getRecentProjects() {
  const res = await fetch("/api/projects", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch projects");
  const projects: Project[] = await res.json();
  return projects.slice(0, 5);
}

export default async function RecentProjects() {
  const projects = await getRecentProjects();
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Recent Projects</h2>
      <ul className="space-y-3">
        {projects.map((project) => (
          <li key={project.id} className="border-b pb-2">
            <a href={project.livelink} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
              {project.title}
            </a>
            <div className="text-xs text-gray-500 dark:text-gray-400">{project.desc}</div>
            <div>
              <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mr-2">GitHub</a>
              {project.download && (
                <a href={project.download} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Download</a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}