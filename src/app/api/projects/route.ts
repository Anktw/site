import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  const envPath = process.env.NEXT_PUBLIC_BASE_URL;
  const filePath = envPath
    ? path.isAbsolute(envPath)
      ? envPath
      : path.join(process.cwd(), envPath)
    : path.join(process.cwd(), "public", "projects.json");
  const data = await fs.readFile(filePath, "utf-8");
  const projects: Array<{ id: number }> = JSON.parse(data);
  // Sort by id descending
  projects.sort((a, b) => b.id - a.id);
  return NextResponse.json(projects);
}