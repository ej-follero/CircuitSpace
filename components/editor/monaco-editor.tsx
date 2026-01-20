"use client";

import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface MonacoEditorProps {
  value: string;
  onChange?: (value: string | undefined) => void;
  language?: "javascript" | "arduino";
  height?: string;
  readOnly?: boolean;
}

export function MonacoEditor({
  value,
  onChange,
  language = "javascript",
  height = "100%",
  readOnly = false,
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    // Note: Monaco language configuration would go here
    // For now, we rely on Monaco's built-in language support
  }, [language]);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    editor.updateOptions({
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: "on",
      roundedSelection: false,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      readOnly,
    });
  };

  return (
    <div className="h-full w-full">
      <Editor
        height={height}
        language={language === "arduino" ? "cpp" : "javascript"}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          automaticLayout: true,
          readOnly,
        }}
      />
    </div>
  );
}

