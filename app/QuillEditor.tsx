import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const QuillNoSSRWrapper = dynamic(() => import('react-quill'), { ssr: false });

export default QuillNoSSRWrapper;
