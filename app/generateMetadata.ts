import { Metadata } from 'next';

type Props = {
  queryParams: {
    title: string;
    description: string;
    mainImage: string;
  };
};

export async function generateMetadata({
  queryParams,
}: Props): Promise<Metadata> {
  let decodedTitle = '';
  let decodedDescription = '';
  let decodedMainImage = '';
  try {
    const encodedTitle = queryParams.title;
    const encodedDescription = queryParams.description;
    const encodedMainImage = queryParams.mainImage;
    decodedTitle = encodedTitle ? decodeURIComponent(encodedTitle) : '';
    decodedDescription = encodedDescription
      ? decodeURIComponent(encodedDescription)
      : '';
    decodedMainImage = encodedMainImage
      ? decodeURIComponent(encodedMainImage)
      : '';
  } catch (error) {
    console.log('generateMetadata ERROR:', error);
  }

  return {
    title: decodedTitle,
    description: decodedDescription,
    openGraph: {
      images: [
        decodedMainImage
          ? {
              url: decodedMainImage,
            }
          : '',
      ],
    },
  };
}
