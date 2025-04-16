import React from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({ code, language, onChange }) {
  return (
    <Editor
      height="60vh"
      theme="vs-dark"
      language={language}
      value={code}
      onChange={onChange}
      options={{ minimap: { enabled: false } }}
    />
  );
}