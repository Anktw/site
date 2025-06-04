import { readFileSync } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'writings.json')
    const jsonData = readFileSync(filePath, 'utf8')
    const data = JSON.parse(jsonData)
    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('Error in API route:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Failed to load blogs', details: message },
      { status: 500 }
    )
  }
}