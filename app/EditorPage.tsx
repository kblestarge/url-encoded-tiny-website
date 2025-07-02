'use client';

import DOMPurify from 'isomorphic-dompurify';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import 'quill/dist/quill.snow.css';
import QuillNoSSRWrapper from './QuillEditor';

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

export default function EditorPage() {
  const [editorMode, setEditorMode] = useState<EditorMode>(EditorMode.HTML);
  const [editorContent, setEditorContent] = useState(
    getContentFromHash() || ''
  );

  // Sync state with hash on mount and hashchange
  useEffect(() => {
    function syncContent() {
      const hashContent = getContentFromHash();
      console.log('Syncing content from hash:', hashContent);
      // Only update if content actually changed to avoid cursor jump
      setEditorContent((prev) => (prev !== hashContent ? hashContent : prev));
    }
    window.addEventListener('hashchange', syncContent);
    return () => window.removeEventListener('hashchange', syncContent);
  }, []);

  // Update hash when editorContent changes, but skip on first render
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Only update hash if content actually changed to avoid infinite loop
    const hashContent = getContentFromHash();
    console.log('Editor content changed, current hashContent:', hashContent);
    console.log(
      'Editor content changed, current editorContent:',
      editorContent
    );
    if (editorContent !== hashContent) {
      const encoded = encodeURIComponent(editorContent);
      const newHash = encoded ? `content=${encoded}` : '';
      console.log('Updating hash:', newHash);
      window.location.hash = newHash ? `#${newHash}` : '';
    }
  }, [editorContent]);

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
      {/* {editorMode === EditorMode.HTML && (
        <main dangerouslySetInnerHTML={{ __html: safeDecodedContent }}></main>
      )} */}
    </>
  );
}
