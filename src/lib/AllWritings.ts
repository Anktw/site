export interface Writings {
  id: number;
  title: string;
  desc: string;
  date: string;
}

export async function getWritings(): Promise<Writings[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/writings`,
      {
        next: {
          revalidate: 3600 
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch writings');
    }    const responseData = await response.json();
    const writings: Writings[] = responseData.posts || [];
    

    return writings.sort((a, b) => b.id - a.id);
  } catch (error) {
    console.error("Error fetching writings:", error);
    return [];
  }
}
