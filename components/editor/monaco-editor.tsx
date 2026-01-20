"use client";

import { useEffect, useRef } from "react";
import Editor, { loader } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface MonacoEditorProps {
  value: string;
  onChange?: (value: string | undefined) => void;
  language?: "javascript" | "arduino";
  height?: string;
  readOnly?: boolean;
}

const IoT_SNIPPETS = [
  {
    label: "iot-sensor",
    kind: 27,
    insertText: [
      "const ${1:Sensor} = {",
      "  read: () => {",
      "    return {",
      "      value: Math.random() * 100,",
      "      timestamp: Date.now()",
      "    };",
      "  }",
      "};",
    ].join("\n"),
    insertTextRules: 4,
    documentation: "Create an IoT sensor object",
  },
  {
    label: "iot-actuator",
    kind: 27,
    insertText: [
      "const ${1:Actuator} = {",
      "  state: false,",
      "  ",
      "  activate: function() {",
      "    this.state = true;",
      "    console.log('${1:Actuator} activated');",
      "  },",
      "  ",
      "  deactivate: function() {",
      "    this.state = false;",
      "    console.log('${1:Actuator} deactivated');",
      "  }",
      "};",
    ].join("\n"),
    insertTextRules: 4,
    documentation: "Create an IoT actuator object",
  },
  {
    label: "iot-monitor",
    kind: 27,
    insertText: [
      "function monitor${1:Device}() {",
      "  const data = ${2:Sensor}.read();",
      "  ",
      "  if (data.value > ${3:threshold}) {",
      "    console.log(`Alert: ${1:Device} value ${data.value} exceeds threshold`);",
      "    return { alert: true, data };",
      "  }",
      "  ",
      "  return { alert: false, data };",
      "}",
      "",
      "setInterval(monitor${1:Device}, ${4:5000});",
    ].join("\n"),
    insertTextRules: 4,
    documentation: "Create a monitoring function with interval",
  },
  {
    label: "iot-threshold",
    kind: 27,
    insertText: [
      "const ${1:THRESHOLD} = ${2:50};",
      "",
      "function checkThreshold(value) {",
      "  if (value > ${1:THRESHOLD}) {",
      "    ${3:// Trigger action}",
      "    return true;",
      "  }",
      "  return false;",
      "}",
    ].join("\n"),
    insertTextRules: 4,
    documentation: "Create a threshold check function",
  },
];

const ARDUINO_SNIPPETS = [
  {
    label: "arduino-setup",
    kind: 27,
    insertText: [
      "void setup() {",
      "  pinMode(${1:pin}, ${2|OUTPUT,INPUT,INPUT_PULLUP|});",
      "  Serial.begin(${3:9600});",
      "  Serial.println(\"${4:Setup complete}\");",
      "}",
    ].join("\n"),
    insertTextRules: 4,
    documentation: "Arduino setup function",
  },
  {
    label: "arduino-loop",
    kind: 27,
    insertText: [
      "void loop() {",
      "  ${1:// Your code here}",
      "  delay(${2:1000});",
      "}",
    ].join("\n"),
    insertTextRules: 4,
    documentation: "Arduino loop function",
  },
  {
    label: "arduino-digital-read",
    kind: 27,
    insertText: [
      "int ${1:value} = digitalRead(${2:pin});",
      "if (${1:value} == ${3|HIGH,LOW|}) {",
      "  ${4:// Action}",
      "}",
    ].join("\n"),
    insertTextRules: 4,
    documentation: "Read digital pin",
  },
  {
    label: "arduino-analog-read",
    kind: 27,
    insertText: [
      "int ${1:value} = analogRead(${2:pin});",
      "Serial.println(${1:value});",
    ].join("\n"),
    insertTextRules: 4,
    documentation: "Read analog pin",
  },
];

export function MonacoEditor({
  value,
  onChange,
  language = "javascript",
  height = "100%",
  readOnly = false,
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    const setupSnippets = async () => {
      const monaco = await loader.init();
      const monacoLanguage = language === "arduino" ? "cpp" : "javascript";
      const snippets = language === "arduino" ? ARDUINO_SNIPPETS : IoT_SNIPPETS;

      monaco.languages.registerCompletionItemProvider(monacoLanguage, {
        provideCompletionItems: () => {
          return {
            suggestions: snippets.map((snippet) => ({
              ...snippet,
              range: undefined as any,
            })),
          };
        },
      });
    };

    setupSnippets();
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
      suggest: {
        snippetsPreventQuickSuggestions: false,
        showSnippets: true,
      },
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

