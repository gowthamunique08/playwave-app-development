import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim()
  if (!query) return NextResponse.json({ results: [], message: 'Enter a song or artist to search.' })
  const key = process.env.YOUTUBE_API_KEY
  if (!key) return NextResponse.json({ results: [], message: 'YouTube search is not configured yet. Add a YouTube API key to enable it.' }, { status: 503 })
  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&key=${encodeURIComponent(key)}`, { next: { revalidate: 30 } })
    const data = await response.json()
    if (!response.ok) {
      const quota = data?.error?.errors?.some((error: { reason?: string }) => error.reason === 'quotaExceeded')
      return NextResponse.json({ results: [], message: quota ? 'YouTube search quota is temporarily exhausted. Try again later.' : 'YouTube could not complete that search right now.' }, { status: response.status === 403 ? 429 : 502 })
    }
    return NextResponse.json({ results: (data.items ?? []).map((item: { id?: { videoId?: string }; snippet?: { title?: string; thumbnails?: { medium?: { url?: string }; default?: { url?: string } } } }) => ({ title: item.snippet?.title ?? 'Untitled video', videoId: item.id?.videoId, thumbnail: item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url ?? '' })).filter((item: { videoId?: string }) => item.videoId) })
  } catch {
    return NextResponse.json({ results: [], message: 'Unable to reach YouTube right now. Please try again.' }, { status: 502 })
  }
}
