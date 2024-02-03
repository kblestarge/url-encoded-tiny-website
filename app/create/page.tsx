"use client";
import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      // TODO:
      // Iframe.configure({
      //   allowDomains: ["www.youtube.com", "player.vimeo.com"],
      // }),
    ],
    content: "<p>Start editing...</p>",
  });

  const [content, setContent] = useState("");

  const handleSave = () => {
    if (editor) {
      const htmlContent = editor.getHTML();
      const encodedContent = encodeURIComponent(htmlContent);
      setContent(encodedContent);
      // Here you would redirect or use the content as needed
      console.log(encodedContent); // For demonstration, log the encoded content
      // You might want to redirect to your display component with the encoded content as a URL parameter
      // window.location.href = `/your-display-component-path?content=${encodedContent}`;
    }
  };

  return (
    <div>
      <EditorContent editor={editor} />
      <button onClick={handleSave}>Save</button>
      {content && <div>Encoded content logged in the console</div>}
    </div>
  );
};

export default Editor;
