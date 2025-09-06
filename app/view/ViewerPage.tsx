'use client';

import DOMPurify from 'isomorphic-dompurify';
import { useEffect, useState } from 'react';

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
  ALLOWED_URI_REGEXP: /^(https?:)?\/\//,
};

export default function ViewerPage() {
  // Get content from hash (client-side only)
  const [content, setContent] = useState('');
  const [hideEditButton, setHideEditButton] = useState(false);

  function getContentFromHash() {
    if (typeof window === 'undefined') return '';
    const hash = window.location.hash;
    const match = hash.match(/content=([^&]*)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  useEffect(() => {
    function syncContent() {
      setContent(getContentFromHash());
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        setHideEditButton(params.get('hideEditButton') === 'true');
      }
    }
    syncContent();
    window.addEventListener('hashchange', syncContent);
    return () => window.removeEventListener('hashchange', syncContent);
  }, []);

  let safeDecodedContent = '';
  try {
    safeDecodedContent = DOMPurify.sanitize(content, SANITIZE_CONFIG) as string;
  } catch (error) {
    console.log('Page ERROR:', error);
    return <p>Something went wrong</p>;
  }

  function handleEditClick() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('editorContent', content);
      // Also store meta fields if present in URL query params
      const params = new URLSearchParams(window.location.search);
      const metaFields = [
        'title',
        'description',
        'mainImage',
        'hideEditButton',
      ];
      metaFields.forEach((field) => {
        const value = params.get(field);
        if (value) {
          sessionStorage.setItem(`editorMeta_${field}`, value);
        }
      });
      window.location.href = '/edit';
    }
  }

  return (
    <>
      {/* Wrap with Quill classes so ql-* styles can take effect */}
      <main className="ql-container ql-snow">
        <div
          className="ql-editor"
          dangerouslySetInnerHTML={{ __html: safeDecodedContent }}
        />
      </main>
      {!hideEditButton && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
            margin: '50px 0',
          }}
        >
          <button
            onClick={handleEditClick}
            style={{
              pointerEvents: 'auto',
              background: '#222',
              color: '#fff',
              padding: '12px 32px',
              borderRadius: 24,
              fontWeight: 600,
              fontSize: 18,
              textDecoration: 'none',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              transition: 'background 0.2s',
            }}
          >
            Edit this website
          </button>
        </div>
      )}
    </>
  );
}
