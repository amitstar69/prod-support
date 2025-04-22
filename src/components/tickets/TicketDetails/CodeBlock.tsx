
import React from "react";

interface CodeBlockProps {
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => (
  <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-md overflow-x-auto text-sm font-mono">
    <code>{code}</code>
  </pre>
);

export default CodeBlock;
