'use client';

import DOMPurify from 'isomorphic-dompurify';
import { useState, useEffect } from 'react';
import 'quill/dist/quill.snow.css';
import QuillNoSSRWrapper from './QuillEditor';
import Link from 'next/link';

/**
 * TODO:
 * - Remove url params (search and hash params) from the edit page. Use internal state instead.
 *    - Or at least make it optional. It should still be an option, but navigating to edit from viewer page button click should use internal state.
 * - Add a "save" button on this edit page that redirects you to the viewer page with the updates.
 * - Add wysiwyg editor mode as url param (e.g. ?mode=wysiwyg) so you can switch between HTML and WYSIWYG modes.
 */

const ALLOWED_IFRAME_DOMAINS = ['www.youtube.com', 'player.vimeo.com'];

// Only allow iframes from specific domains (youtube and vimeo)
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.nodeName === 'IFRAME') {
    const srcAttr = node.getAttribute('src');
    if (srcAttr) {
      const srcUrl = new URL(srcAttr);
      const domain = srcUrl.hostname;
      if (!ALLOWED_IFRAME_DOMAINS.includes(domain)) {
        node.removeAttribute('src');
      }
    }
  }
});

// Only allow iframe tags with limitted attributes
const SANITIZE_CONFIG = {
  ADD_TAGS: ['iframe', 'img'],
  ADD_ATTR: [
    'src',
    'width',
    'height',
    'frameborder',
    'allow',
    'allowfullscreen',
    'alt',
    'title',
    'style',
    // For <img>
    'src',
    'alt',
    'title',
    'width',
    'height',
    'style',
  ],
  FORBID_ATTR: ['onerror', 'onload', 'onclick'],
  FORBID_TAGS: [],
  // Only allow images from the web (not data: or blob:)
  ALLOWED_URI_REGEXP: /^(https?:)?\/\//,
};

// Add a DOMPurify hook to restrict <img> src to web URLs only
DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (node.nodeName === 'IMG') {
    const src = node.getAttribute('src') || '';
    if (!src.match(/^https?:\/\//)) {
      node.removeAttribute('src');
    }
  }
});

export enum EditorMode {
  WYSIWYG = 'wysiwyg',
  HTML = 'html',
}

// Helper to parse content from hash
function getContentFromHash() {
  if (typeof window === 'undefined') return '';
  const hash = window.location.hash;
  console.log('Current hash:', hash);
  const match = hash.match(/content=([^&]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

// Helper to parse query params from URL
function getQueryParam(name: string) {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || '';
}

// Helper to get initial meta field value (sessionStorage > query param)
function getInitialMetaField(field: string) {
  if (typeof window === 'undefined') return '';
  const sessionValue = sessionStorage.getItem(`editorMeta_${field}`);
  if (sessionValue) {
    sessionStorage.removeItem(`editorMeta_${field}`);
    return sessionValue;
  }
  return getQueryParam(field);
}

export default function EditorPage() {
  // Try to get content from sessionStorage first, then fallback to hash
  function getInitialContent() {
    if (typeof window === 'undefined') return '';
    const sessionContent = sessionStorage.getItem('editorContent');
    if (sessionContent) {
      sessionStorage.removeItem('editorContent'); // Clear after use
      return sessionContent;
    }
    return getContentFromHash();
  }

  const [editorMode, setEditorMode] = useState<EditorMode>(EditorMode.HTML);
  const [editorContent, setEditorContent] = useState(getInitialContent());
  const [title, setTitle] = useState(getInitialMetaField('title'));
  const [description, setDescription] = useState(
    getInitialMetaField('description')
  );
  const [mainImage, setMainImage] = useState(getInitialMetaField('mainImage'));

  let safeDecodedContent = '';
  try {
    safeDecodedContent = DOMPurify.sanitize(editorContent, SANITIZE_CONFIG);
  } catch (error) {
    console.log('Page ERROR:', error);
    return <p>Something went wrong</p>;
  }

  /**
   * TODO:
   * - Add HTML formatter
   * - Fix the WYSIWYG editor to allow for style properties on HTML elements
   * - Add more toolbar options to WYSIWYG editor (e.g. font size, font family, text color, background color)
   * - Add image and video support to WYSIWYG editor (should only allow URLs from the web, not data: or blob: or local files)
   * - Add a character count and word count
   */

  return (
    <>
      {/* Meta fields */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div
          style={{
            flex: '1 1 300px',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <label style={{ marginBottom: 8, fontWeight: 500 }}>
            Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                marginTop: 4,
                marginBottom: 0,
                padding: 8,
                borderRadius: 6,
                border: '1px solid #ccc',
                fontSize: 18,
              }}
              placeholder="Enter title"
            />
          </label>
        </div>
        <div
          style={{
            flex: '1 1 300px',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <label style={{ marginBottom: 8, fontWeight: 500 }}>
            Main Image URL:
            <input
              type="text"
              value={mainImage}
              onChange={(e) => setMainImage(e.target.value)}
              style={{
                width: '100%',
                marginTop: 4,
                marginBottom: 0,
                padding: 8,
                borderRadius: 6,
                border: '1px solid #ccc',
                fontSize: 18,
              }}
              placeholder="Enter main image URL"
            />
          </label>
          {mainImage && (
            <img
              src={mainImage}
              alt="Main preview"
              style={{
                marginTop: 8,
                maxWidth: '100%',
                maxHeight: 120,
                borderRadius: 8,
                objectFit: 'cover',
                border: '1px solid #eee',
                background: '#fafafa',
              }}
            />
          )}
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              marginTop: 4,
              marginBottom: 12,
              minHeight: 60,
              padding: 8,
              borderRadius: 6,
              border: '1px solid #ccc',
              fontSize: 16,
            }}
            placeholder="Enter description"
          />
        </label>
      </div>
      <div className="editor-controls" style={{ marginBottom: 16 }}>
        <button
          onClick={() => setEditorMode(EditorMode.WYSIWYG)}
          disabled={editorMode === EditorMode.WYSIWYG}
          style={{ marginRight: 8 }}
        >
          WYSIWYG
        </button>
        <button
          onClick={() => setEditorMode(EditorMode.HTML)}
          disabled={editorMode === EditorMode.HTML}
        >
          HTML
        </button>
      </div>
      <div style={{ marginBottom: 24 }}>
        {editorMode === EditorMode.WYSIWYG ? (
          <QuillNoSSRWrapper
            theme="snow"
            value={editorContent}
            onChange={setEditorContent}
            style={{ minHeight: 200 }}
          />
        ) : (
          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            style={{
              width: '100%',
              minHeight: 200,
              fontFamily: 'monospace',
            }}
          />
        )}
      </div>
      <Link
        href={{
          pathname: '/',
          hash: `content=${encodeURIComponent(editorContent)}`,
          query: {
            title,
            description,
            mainImage,
          },
        }}
        style={{
          display: 'inline-block',
          background: '#222',
          color: '#fff',
          padding: '12px 32px',
          borderRadius: 24,
          textDecoration: 'none',
        }}
      >
        View
      </Link>
      {/* {editorMode === EditorMode.HTML && (
        <main dangerouslySetInnerHTML={{ __html: safeDecodedContent }}></main>
      )} */}
    </>
  );
}
