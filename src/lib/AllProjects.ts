export interface Projects {
  id: number;
  title: string;
  desc: string;
  livelink: string;
  github: string;
}

export async function getProjects(): Promise<Projects[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects`,
      {
        next: {
          revalidate: 3600 
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    const data: Projects[] = await response.json();
    return data.sort((a, b) => b.id - a.id);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}
