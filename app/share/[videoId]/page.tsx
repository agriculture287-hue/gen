import ShareClientView from './ShareClientView';

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ videoId: string }> | { videoId: string };
}

export async function generateMetadata() {
  const title = 'Open in GEN Music';
  const description = 'This content was shared using GEN Music.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: 'https://genmusics.vercel.app/share',
      siteName: 'GEN Music',
      images: [
        {
          url: 'https://genmusics.vercel.app/logo.png',
          width: 512,
          height: 512,
          alt: 'GEN Music Logo'
        }
      ],
      type: 'website'
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: ['https://genmusics.vercel.app/logo.png']
    }
  };
}

export default async function SharePage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const videoId = resolvedParams?.videoId || '';

  return (
    <main>
      <ShareClientView videoId={videoId} />
    </main>
  );
}
