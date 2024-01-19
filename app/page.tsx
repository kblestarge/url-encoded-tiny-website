import { Metadata } from "next";

type Props = {
  searchParams: {
    title: string;
    description: string;
    mainImage: string;
    content: string;
  };
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  let decodedTitle = "";
  let decodedDescription = "";
  let decodedMainImage = "";
  try {
    const encodedTitle = searchParams.title;
    const encodedDescription = searchParams.description;
    const encodedMainImage = searchParams.mainImage;
    decodedTitle = encodedTitle ? decodeURIComponent(encodedTitle) : "";
    decodedDescription = encodedDescription
      ? decodeURIComponent(encodedDescription)
      : "";
    decodedMainImage = encodedMainImage
      ? decodeURIComponent(encodedMainImage)
      : "";
  } catch (error) {
    console.log("generateMetadata ERROR:", error);
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
          : "",
      ],
    },
  };
}

export default function Page({ searchParams }: Props) {
  let decodedContent = "";
  try {
    const encodedContent = searchParams.content;
    decodedContent = encodedContent ? decodeURIComponent(encodedContent) : "";
  } catch (error) {
    console.log("Page ERROR:", error);
    return <p>Something went wrong</p>;
  }
  return <main dangerouslySetInnerHTML={{ __html: decodedContent }}></main>;
}
