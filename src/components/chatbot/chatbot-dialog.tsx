
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link'; // Import Link
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { findProducts, type ProductFinderOutput } from '@/ai/flows/product-finder-flow';

interface ChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChatMessage {
    sender: 'user' | 'bot';
    text: string;
    // Optional: Store structured data like product links alongside the message
    productLinks?: Array<{ id: string; name: string; href: string }>;
}

export function ChatbotDialog({ open, onOpenChange }: ChatbotDialogProps) {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);


  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const userMessageText = inputValue.trim();
    if (!userMessageText || isLoading) return;

    const newUserMessage: ChatMessage = { sender: 'user', text: userMessageText };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response: ProductFinderOutput = await findProducts({ query: userMessageText });
      const botMessage: ChatMessage = {
          sender: 'bot',
          text: response.reply,
          productLinks: response.foundProducts?.map(p => ({
              id: p.id,
              name: p.name,
              href: `/products/${p.id}`
          }))
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: ChatMessage = { sender: 'bot', text: "Sorry, I encountered an error while trying to help. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] md:max-w-[600px] flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            AI Luxury Assistant
          </DialogTitle>
          <DialogDescription>
            Ask about products, brands, styles, or availability. E.g., "Show me Rolex watches" or "Any Gucci bags?"
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow border rounded-md p-4 h-64 min-h-[200px]" viewportRef={scrollAreaRef}>
           <div className="space-y-4">
             {messages.length === 0 && (
                 <p className="text-muted-foreground text-center py-8">Start the conversation by typing below.</p>
             )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3",
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.sender === 'bot' && (
                  <div className="p-2 bg-primary rounded-full text-primary-foreground mt-1 shrink-0">
                    <Bot size={16} />
                  </div>
                )}
                 <div
                    className={cn(
                        "rounded-lg px-4 py-2 max-w-[80%]",
                        msg.sender === 'user'
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    )}
                 >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    {msg.productLinks && msg.productLinks.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-muted-foreground/30">
                            <p className="text-xs font-medium text-muted-foreground mb-1">View products:</p>
                            <ul className="space-y-1">
                                {msg.productLinks.map(link => (
                                    <li key={link.id}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-accent hover:underline hover:text-accent/80"
                                            onClick={() => onOpenChange(false)} // Close dialog on link click
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                 </div>
                {msg.sender === 'user' && (
                  <div className="p-2 bg-accent rounded-full text-accent-foreground mt-1 shrink-0">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
             {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                    <div className="p-2 bg-primary rounded-full text-primary-foreground mt-1 shrink-0">
                        <Bot size={16} />
                    </div>
                    <div className="rounded-lg px-4 py-2 max-w-[80%] bg-secondary text-secondary-foreground">
                        <p className="text-sm flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                        </p>
                    </div>
                </div>
             )}
           </div>
        </ScrollArea>

        <DialogFooter className="mt-4 pt-4 border-t">
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Input
              placeholder="Ask me about luxury items..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-grow"
              disabled={isLoading}
              aria-label="Chat input"
            />
            <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} aria-label="Send message">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
