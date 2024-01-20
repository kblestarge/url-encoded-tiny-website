import { Metadata } from "next";
import DOMPurify from "isomorphic-dompurify";

// Allow iframe tags with limitted attributes
const SANITIZE_CONFIG = {
  ADD_TAGS: ["iframe"],
  ADD_ATTR: [
    "src", // TODO: further restrict to only allow certain domains (like youtube or vimeo)
    "width",
    "height",
    "frameborder",
    "allow",
    "allowfullscreen",
  ],
};

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
  let safeDecodedContent = "";
  try {
    const encodedContent = searchParams.content;
    const decodedContent = encodedContent
      ? decodeURIComponent(encodedContent)
      : "";
    safeDecodedContent = DOMPurify.sanitize(decodedContent, SANITIZE_CONFIG);
  } catch (error) {
    console.log("Page ERROR:", error);
    return <p>Something went wrong</p>;
  }
  return <main dangerouslySetInnerHTML={{ __html: safeDecodedContent }}></main>;
}
