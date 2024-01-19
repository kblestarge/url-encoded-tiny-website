# URL Encoded Tiny Website

TODO:

- Finish this readme
- Create a very clear example website, showing all the things it can do and the limitations.
- Create a website creator page
  - Little text editor
  - Or raw HTML editor
  - "x number of characters left" counter
  - Add metadata input forms (title, description, image)
  - TinyURL integration
  - QR code integration
  - About page

## What is this?

This is the simplest, easiest, quickest, cheapest, way to create a website.
It's free and annonymous, no need to sign-up or log-in.
But it must be tiny 😅.

### How it works

I'm using the URL as a content management system (CMS). All rendered content on the page will come from the URL's query params. Here are the available query params:

- `content`. This is the content of the page. You can put raw text in here or HTML.
- `title`. This is the website title that appears above the tab in the browser.
- `description`. This is the website description that will appear in the <head> metadata.
- `mainImage`. This is the website's OG image that will appear in the metadata.

The website is server-side rendered using next.js, so the link you create for your website will support a link/URL preview.

### Examples

TODO: like to the example.md

## Limitations

- Long, ridiculous URL for your custom website.
- Website limited to 2048 characters (actually fewer considering the baseUrl, query param keys, etc. It's probably more like 2000.)
- Must use in-line CSS for styling.
- No way to edit your website and keep the same existing URL (because the URL is the website).

## Getting Started

Install dependencies:

```bash
yarn install
```

Run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
