import { fetchShareMetadata } from '../../../src/lib/shareCore';
import ShareClientView from './ShareClientView';

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ videoId: string }> | { videoId: string };
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const videoId = resolvedParams?.videoId;
  
  if (!videoId) {
    return {
      title: 'Share • GEN Music',
      description: 'Listen to your favorite songs on GEN Music with Dolby 3D spatial surround sound.'
    };
  }

  const song = await fetchShareMetadata(videoId, 'song');
  if (!song) {
    return {
      title: 'Content Not Available • GEN Music',
      description: 'The requested song could not be found or has been removed.'
    };
  }

  const title = `${song.title} • GEN Music`;
  const description = `Listen to ${song.title} on GEN Music.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://genmusics.vercel.app/share/${videoId}`,
      siteName: 'GEN Music',
      images: [
        {
          url: song.thumbnail,
          width: 1280,
          height: 720,
          alt: song.title
        }
      ],
      type: 'music.song'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [song.thumbnail]
    }
  };
}

export default async function SharePage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const videoId = resolvedParams?.videoId;
  const songData = videoId ? await fetchShareMetadata(videoId, 'song') : null;

  return (
    <main>
      <ShareClientView initialData={songData} videoId={videoId} />
    </main>
  );
}
