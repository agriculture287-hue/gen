import { Metadata } from 'next';
import ShareClientPage from './ShareClientPage';

interface Props {
  params: Promise<{ videoId: string }> | { videoId: string };
}

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  // Handle Next.js 15 async params resolution safely
  const resolvedParams = params && typeof params.then === 'function' ? await params : params;
  const videoId = resolvedParams?.videoId;
  
  if (!videoId) {
    return {
      title: 'Shared Song • GEN MUSIC',
      description: 'Listen to shared music in 3D surround sound on GEN MUSIC.',
    };
  }

  try {
    // In production, fetch absolute URL. Since this is metadata compilation, fetch gracefully.
    const res = await fetch(`https://genmusics.vercel.app/api/song/${videoId}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const song = await res.json();
      return {
        title: `${song.title} • GEN MUSIC`,
        description: `Listen to ${song.title} by ${song.artist} on GEN MUSIC. Experience immersive 3D spatial Dolby audio, offline downloads, and zero subscriptions.`,
        openGraph: {
          title: `${song.title} - ${song.artist}`,
          description: `Listen to ${song.title} on GEN MUSIC.`,
          images: [{ url: song.thumbnail }],
          type: 'music.song',
        },
        twitter: {
          card: 'summary_large_image',
          title: `${song.title} - ${song.artist}`,
          description: `Listen to ${song.title} on GEN MUSIC.`,
          images: [song.thumbnail],
        },
      };
    }
  } catch (e) {
    // Fallback on error
  }

  return {
    title: 'Shared Song • GEN MUSIC',
    description: 'Listen to shared music on GEN MUSIC.',
  };
}

export default async function Page({ params }: { params: any }) {
  const resolvedParams = params && typeof params.then === 'function' ? await params : params;
  const videoId = resolvedParams?.videoId || 'dQw4w9WgXcQ';
  
  return <ShareClientPage videoId={videoId} />;
}
