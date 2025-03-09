
import React, { useState } from 'react';
import { Textarea } from './ui/textarea';

interface CodeEditorProps {
  initialCode?: string;
  onUpdate?: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialCode = "", onUpdate }) => {
  const [code, setCode] = useState(initialCode);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onUpdate) {
      onUpdate(newCode);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Textarea
        className="font-mono text-sm min-h-[300px] flex-grow"
        value={code}
        onChange={handleCodeChange}
        placeholder="// Type your code here"
      />
    </div>
  );
};

export default CodeEditor;
