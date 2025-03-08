
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Copy, Check, RefreshCw } from 'lucide-react';

interface CodeEditorProps {
  initialCode: string;
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialCode, language = 'javascript' }) => {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetCode = () => {
    setCode(initialCode);
  };

  return (
    <div className="w-full border rounded-md overflow-hidden">
      <div className="bg-muted px-4 py-2 flex justify-between items-center text-sm">
        <div className="flex items-center">
          <span className="text-muted-foreground mr-2">Code Editor</span>
          <span className="bg-secondary px-2 py-0.5 rounded-sm text-xs">{language}</span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={handleResetCode}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={handleCopyCode}
          >
            {copied ? (
              <Check className="h-4 w-4 mr-1 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>
      <textarea 
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full font-mono text-sm p-4 h-[550px] bg-background focus:outline-none border-0"
        spellCheck={false}
      />
    </div>
  );
};

export default CodeEditor;
