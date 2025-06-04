export interface Writing {
  id: number;
  title: string;
  desc: string;
  date: string;
}

export async function getWritings(): Promise<Writing[]> {
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
    const writings: Writing[] = responseData.posts || [];
    

    return writings.sort((a, b) => b.id - a.id).slice(0, 3);
  } catch (error) {
    console.error("Error fetching writings:", error);
    return [];
  }
}
