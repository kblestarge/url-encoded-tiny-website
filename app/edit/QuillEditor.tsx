import dynamic from 'next/dynamic';
import 'quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const defaultModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    [{ font: [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['link'],
    [{ color: [] }, { background: [] }],
    ['clean'],
  ],
  clipboard: {
    matchVisual: false, // fixes issue with added line breaks before <ul> and heading elements
  },
};

const defaultFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'indent',
  'align',
  'color',
  'background',
  'font',
  'link',
  'image',
  'video',
];

type AnyProps = Record<string, any>;

export default function QuillNoSSRWrapper(props: AnyProps) {
  const modules = props.modules ?? defaultModules;
  const formats = props.formats ?? defaultFormats;
  return <ReactQuill {...props} modules={modules} formats={formats} />;
}
