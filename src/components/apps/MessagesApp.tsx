'use client';

import { useState, useEffect } from 'react';

interface MessagesAppProps {
  onAchievement?: (id: string) => void;
  onComplete?: () => void;
}

interface Message {
  id: number;
  sender: string;
  preview: string;
  content: string;
  read: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    sender: 'SYSTEM',
    preview: 'Welcome to ULTRAINT...',
    content: `Welcome to ULTRAINT.

This is your personal operating system. Everything here was built by Mateus Muste.

Explore the desktop. Open apps. Find secrets.

Some things are hidden. Some things are locked. Some things require patience.

Good luck.

- SYSTEM`,
    read: false,
  },
  {
    id: 2,
    sender: 'UNKNOWN',
    preview: 'We need to talk...',
    content: `We need to talk.

I know you just got here, but there's something you should know.

This isn't just a portfolio. It's a story. And you're part of it now.

Look for the clues. They're everywhere.

Start with the games. The answers are in the games.

- ???`,
    read: false,
  },
  {
    id: 3,
    sender: 'FUTURE_SELF',
    preview: 'You made it...',
    content: `You made it.

I knew you would find this. I left it here for you.

By now you've probably figured out that something strange is happening. That's okay. It's supposed to feel that way.

Keep going. The path forward requires:
1. Playing the games
2. Reading the books
3. Using the terminal
4. Finding the hidden commands

Remember: "sudo" is your friend.

- You (from the future)`,
    read: false,
  },
];

export function MessagesApp({ onAchievement, onComplete }: MessagesAppProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const unreadCount = messages.filter((m) => !m.read).length;

  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      setMessages((msgs) =>
        msgs.map((m) => (m.id === message.id ? { ...m, read: true } : m))
      );
    }
  };

  // Check if all messages read
  useEffect(() => {
    const allRead = messages.every((m) => m.read);
    if (allRead && messages.length > 0) {
      onAchievement?.('INBOX_ZERO');
      onComplete?.();
    }
  }, [messages, onAchievement, onComplete]);

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="app-header">
        <span className="app-header-title">MESSAGES.EXE</span>
        <span className="text-gray-500 text-sm">
          {unreadCount > 0 ? `${unreadCount} UNREAD` : 'INBOX EMPTY'}
        </span>
      </div>

      {selectedMessage ? (
        <div className="flex-grow flex flex-col">
          {/* Message header */}
          <div className="p-4 border-b-2 border-black">
            <button
              onClick={() => setSelectedMessage(null)}
              className="font-mono text-xs text-gray-500 hover:text-black mb-2"
            >
              &lt; BACK
            </button>
            <div className="font-mono text-sm font-bold">{selectedMessage.sender}</div>
          </div>

          {/* Message content */}
          <div className="flex-grow overflow-auto p-4">
            <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed">
              {selectedMessage.content}
            </pre>
          </div>
        </div>
      ) : (
        <div className="flex-grow overflow-auto">
          {messages.map((message) => (
            <button
              key={message.id}
              onClick={() => openMessage(message)}
              className={`w-full p-4 border-b border-gray-200 text-left hover:bg-gray-50 ${
                !message.read ? 'bg-yellow-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className={`font-mono text-xs ${!message.read ? 'font-bold' : ''}`}>
                    {message.sender}
                  </div>
                  <div className="font-mono text-[10px] text-gray-500 mt-1">
                    {message.preview}
                  </div>
                </div>
                {!message.read && (
                  <div className="w-2 h-2 bg-black rounded-full" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
