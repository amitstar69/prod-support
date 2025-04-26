
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { HelpRequest } from '../../types/helpRequest';
import { FileIcon, Paperclip } from 'lucide-react';
import { Button } from '../ui/button';

interface AttachmentsPanelProps {
  ticket: HelpRequest;
}

type Attachment = {
  name: string;
  url: string;
  type: string;
  size?: number;
};

const AttachmentsPanel: React.FC<AttachmentsPanelProps> = ({ ticket }) => {
  // Extract attachments from ticket if available
  const attachments: Attachment[] = ticket.attachments as Attachment[] || [];

  // Function to handle attachment download
  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Paperclip className="h-5 w-5 mr-2" />
          Attachments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <p className="text-muted-foreground">No attachments for this ticket</p>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-900"
              >
                <div className="flex items-center space-x-3">
                  <FileIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(attachment.url, attachment.name)}
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttachmentsPanel;
