import dynamic from 'next/dynamic';
import { generateMetadata as dynamicGenerateMetadata } from './generateMetadata';

const ViewerPage = dynamic(() => import('./ViewerPage'), { ssr: false });

export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: { title?: string; description?: string; mainImage?: string };
}) => {
  // Map searchParams to queryParams for generateMetadata.ts
  return dynamicGenerateMetadata({
    queryParams: {
      title: searchParams.title || '',
      description: searchParams.description || '',
      mainImage: searchParams.mainImage || '',
    },
  });
};

export default function Page() {
  return <ViewerPage />;
}
