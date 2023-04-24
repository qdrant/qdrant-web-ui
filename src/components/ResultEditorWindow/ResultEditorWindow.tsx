import Editor from "@monaco-editor/react";

type ResultEditorWindowProps = {
  code: string;
};

function formatJSON(val: string) {
  try {
    const res = JSON.parse(val ?? "{}");
    return JSON.stringify(res, null, 2);
  } catch {
    const errorJson = {
      error: `HERE ${val}`,
    };
    return JSON.stringify(errorJson, null, 2);
  }
}
export const ResultEditorWindow = ({ code }: ResultEditorWindowProps) => {
  return (
    <Editor
      height="82vh"
      language="json"
      theme={"custom-language-theme"}
      value={formatJSON(code)}
      options={{
        scrollBeyondLastLine: false,
        fontSize: 12,
        wordWrap: "on",
        minimap: { enabled: false },
        automaticLayout: true,
        readOnly: true,
        mouseWheelZoom: true,
      }}
    />
  );
};
