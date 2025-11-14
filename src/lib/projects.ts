export interface Project {
  id: number;
  title: string;
  desc: string;
  livelink: string;
  github: string;
}

export async function getProjects(): Promise<Project[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects`,
      {
        next: {
          revalidate: 5 // Revalidate every hour
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    const data: Project[] = await response.json();
    return data.sort((a, b) => b.id - a.id).slice(0, 5);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}
