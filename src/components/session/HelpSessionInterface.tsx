import { useState, useEffect, useRef } from 'react';
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import ChatInterface from "./ChatInterface";
import { 
  ArrowRight, 
  MessageSquare, 
  Code, 
  SplitSquareVertical, 
  MonitorSmartphone,
  RefreshCw
} from "lucide-react";
// import CodeEditor from "../code/CodeEditor"; // Temporarily commented out

const HelpSessionInterface = ({ 
  sessionId, 
  clientId, 
  developerId, 
  currentUserId,
  sessionDetails,
  onSessionEnd
}) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [screenSharing, setScreenSharing] = useState(false);
  const [sharedCode, setSharedCode] = useState('');
  const [showSideBySide, setShowSideBySide] = useState(false);
  const [otherUserId, setOtherUserId] = useState('');
  const [otherUserName, setOtherUserName] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const codeEditorRef = useRef(null);
  const [editorText, setEditorText] = useState("// Start coding here");
  
  useEffect(() => {
    if (clientId && developerId && currentUserId) {
      const otherId = currentUserId === clientId ? developerId : clientId;
      setOtherUserId(otherId);

      // Determine the other user's name based on sessionDetails
      if (sessionDetails) {
        const otherUser = currentUserId === clientId ? sessionDetails.developer : sessionDetails.client;
        setOtherUserName(otherUser?.name || 'Other User');
      }
    }
  }, [clientId, developerId, currentUserId, sessionDetails]);
  
  const toggleScreenSharing = () => {
    setScreenSharing(!screenSharing);
  };

  const handleCodeChange = (newCode) => {
    setSharedCode(newCode);
  };

  const handleEndSession = () => {
    if (onSessionEnd) {
      onSessionEnd();
    }
  };
  
  const toggleSideBySideView = () => {
    setShowSideBySide(!showSideBySide);
  };
  
  const handleRefreshCode = () => {
    if (codeEditorRef.current) {
      codeEditorRef.current.refresh();
    }
  };
  
  // Temporary render function that replaces the CodeEditor component
  const renderTemporaryCodeEditor = () => {
    return (
      <div className="h-full w-full bg-gray-800 text-white p-4 font-mono overflow-auto">
        <div className="mb-4">
          <p className="text-yellow-300 text-xs">// CodeEditor component temporarily disabled</p>
          <p className="text-yellow-300 text-xs">// This is a placeholder UI for the code editor</p>
        </div>
        <textarea
          className="w-full h-[80%] bg-gray-900 text-green-400 p-2 border border-gray-700 rounded"
          value={editorText}
          onChange={(e) => setEditorText(e.target.value)}
        />
        <div className="mt-2 flex justify-between">
          <div>
            <select 
              className="bg-gray-700 text-white px-2 py-1 rounded"
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <button 
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            onClick={() => console.log('Code saved (placeholder)')}
          >
            Save
          </button>
        </div>
      </div>
    );
  };
  
  // Find every instance where <CodeEditor /> is used and replace it with renderTemporaryCodeEditor()
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Help Session</h2>
          <Button variant="destructive" onClick={handleEndSession}>
            End Session <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={toggleScreenSharing}>
              {screenSharing ? 'Stop Sharing' : 'Share Screen'}
              <MonitorSmartphone className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={toggleSideBySideView}>
              {showSideBySide ? 'Single View' : 'Side-by-Side'}
              <SplitSquareVertical className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleRefreshCode}>
              Refresh Code <RefreshCw className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-grow overflow-hidden">
        {showSideBySide ? (
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full border rounded-md"
          >
            <ResizablePanel defaultSize={50} className="h-full">
              <ChatInterface 
                helpRequestId={sessionId} 
                otherId={otherUserId}
                otherName={otherUserName}
                currentUserId={currentUserId}
                readOnly={false}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} className="h-full">
              {renderTemporaryCodeEditor()}
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Chat
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="h-4 w-4" /> Code Editor
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="h-[calc(100%-46px)]">
              <ChatInterface 
                helpRequestId={sessionId} 
                otherId={otherUserId}
                otherName={otherUserName}
                currentUserId={currentUserId}
                readOnly={false}
              />
            </TabsContent>
            <TabsContent value="code" className="h-[calc(100%-46px)]">
              {renderTemporaryCodeEditor()}
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      <div className="p-4 border-t">
        <p className="text-sm text-muted-foreground">
          Session ID: {sessionId} | Client ID: {clientId} | Developer ID: {developerId}
        </p>
      </div>
    </div>
  );
};

export default HelpSessionInterface;
