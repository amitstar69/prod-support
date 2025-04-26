
import { MessageSquare, PhoneCall, Video } from "lucide-react";

export const messageTypeIconMap = {
  chat: <MessageSquare className="h-4 w-4 mr-2" />,
  voice: <PhoneCall className="h-4 w-4 mr-2" />,
  video: <Video className="h-4 w-4 mr-2" />
};
