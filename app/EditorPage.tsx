'use client';

import DOMPurify from 'isomorphic-dompurify';
import { useState, useEffect, useRef } from 'react';
import 'quill/dist/quill.snow.css';
import QuillNoSSRWrapper from './QuillEditor';
import Link from 'next/link';

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
  const [showMetaFields, setShowMetaFields] = useState(false);
  const [editorContent, setEditorContent] = useState(getInitialContent());
  const [title, setTitle] = useState(getInitialMetaField('title'));
  const [description, setDescription] = useState(
    getInitialMetaField('description')
  );
  const [mainImage, setMainImage] = useState(getInitialMetaField('mainImage'));

  // Accordion measurement for smooth open/close animation
  const metaContentRef = useRef<HTMLDivElement>(null);
  const [metaMaxHeight, setMetaMaxHeight] = useState(0);

  // Measure on mount and window resize
  useEffect(() => {
    const updateHeight = () => {
      if (metaContentRef.current) {
        setMetaMaxHeight(metaContentRef.current.scrollHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Recalculate when content changes or accordion state toggles
  useEffect(() => {
    if (metaContentRef.current) {
      setMetaMaxHeight(metaContentRef.current.scrollHeight);
    }
  }, [showMetaFields, title, description, mainImage]);

  let safeDecodedContent = '';
  try {
    safeDecodedContent = DOMPurify.sanitize(editorContent, SANITIZE_CONFIG);
  } catch (error) {
    console.log('Page ERROR:', error);
    return <p>Something went wrong</p>;
  }

  /**
   * TODO:
   * - Add HTML formatter, and maybe validator...?
   * - at least make the editor allow for tabbing.
   *
   * - Fix the WYSIWYG editor to allow for style properties on HTML elements
   * - Add more toolbar options to WYSIWYG editor (e.g. font size, font family, text color, background color)
   * - Add image and video support to WYSIWYG editor (should only allow URLs from the web, not data: or blob: or local files)
   * - Add a character count and word count
   * -
   * - Add tooltip popups to explain more
   * - Add option to hide "edit" button from website
   */

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            margin: 0,
          }}
        >
          Meta Fields
        </h2>
        <button
          onClick={() => setShowMetaFields((v) => !v)}
          aria-expanded={showMetaFields}
          aria-controls="meta-fields-panel"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: '1px solid #ddd',
            borderRadius: 6,
            padding: '6px 8px',
            cursor: 'pointer',
          }}
          title={showMetaFields ? 'Hide meta fields' : 'Show meta fields'}
        >
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            {showMetaFields ? 'Hide' : 'Show'}
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{
              transform: `rotate(${showMetaFields ? 180 : 0}deg)`,
              transition: 'transform 200ms ease',
            }}
          >
            <path
              d="M7 10l5 5 5-5"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div
        id="meta-fields-panel"
        style={{
          overflow: 'hidden',
          transition: 'max-height 300ms ease',
          maxHeight: showMetaFields ? metaMaxHeight : 0,
        }}
        aria-hidden={!showMetaFields}
      >
        <div ref={metaContentRef}>
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
                    width: 'calc(100% - 16px)',
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
                    width: 'calc(100% - 16px)',
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
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label
              style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
            >
              Description:
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: 'calc(100% - 16px)',
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
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <h2
          style={{
            fontSize: '20px',
          }}
        >
          Content
        </h2>
        <div className="editor-controls">
          <button
            style={{
              background: 'transparent',
              border: '1px solid #ddd',
              borderRadius: 6,
              padding: '6px 8px',
              cursor: 'pointer',
            }}
            onClick={() =>
              setEditorMode(
                editorMode === EditorMode.HTML
                  ? EditorMode.WYSIWYG
                  : EditorMode.HTML
              )
            }
          >
            {editorMode === EditorMode.HTML
              ? 'Switch to WYSIWYG Editor'
              : 'Switch to HTML Editor'}
          </button>
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        {editorMode === EditorMode.WYSIWYG ? (
          <QuillNoSSRWrapper
            theme="snow"
            value={editorContent}
            onChange={(value: any) => {
              console.log('onChange value', value);
              setEditorContent(value);
            }}
            className="ql-min-h"
            style={{ minHeight: 200 }}
          />
        ) : (
          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            style={{
              width: 'calc(100% - 8px)',
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
