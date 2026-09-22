import { fetchShareMetadata } from '../../../../src/lib/shareCore';
import ShareClientView from '../[videoId]/ShareClientView';

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ type: string; id: string }> | { type: string; id: string };
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const type = (resolvedParams?.type as 'song' | 'album' | 'playlist' | 'artist') || 'song';
  const id = resolvedParams?.id;

  if (!id) {
    return {
      title: 'Share • GEN Music',
      description: 'Listen to your favorite songs on GEN Music with Dolby 3D spatial surround sound.'
    };
  }

  const data = await fetchShareMetadata(id, type);
  if (!data) {
    return {
      title: 'Content Not Available • GEN Music',
      description: 'The requested content could not be found or has been removed.'
    };
  }

  const title = `${data.title} • GEN Music`;
  const description = `Listen to ${data.title} on GEN Music.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://genmusics.vercel.app/share/${type}/${id}`,
      siteName: 'GEN Music',
      images: [
        {
          url: data.thumbnail,
          width: 1280,
          height: 720,
          alt: data.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [data.thumbnail]
    }
  };
}

export default async function ShareTypedPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const type = (resolvedParams?.type as 'song' | 'album' | 'playlist' | 'artist') || 'song';
  const id = resolvedParams?.id;
  const data = id ? await fetchShareMetadata(id, type) : null;

  return (
    <main>
      <ShareClientView initialData={data} videoId={id} />
    </main>
  );
}
