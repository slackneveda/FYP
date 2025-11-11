import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Minimize2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "👋 Hi! I'm here to help with any questions about Sweet Dessert!",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
    }
  }, [isOpen]);

  const getAssistantResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    if (message.includes('menu') || message.includes('dessert')) {
      return "🍰 We offer cakes, cookies, brownies, cupcakes, donuts, and ice cream! Check our Menu page for details.";
    }
    if (message.includes('order') || message.includes('buy')) {
      return "📦 Browse our menu, add to cart, and checkout! Choose delivery or takeaway.";
    }
    if (message.includes('deliver') || message.includes('shipping')) {
      return "🚗 We offer delivery and takeaway options. Select your preference at checkout!";
    }
    if (message.includes('price') || message.includes('cost')) {
      return "💰 Our desserts are competitively priced! Check the menu for specific prices.";
    }
    if (message.includes('hello') || message.includes('hi')) {
      return "👋 Hello! How can I help you today?";
    }
    if (message.includes('thank')) {
      return "😊 You're welcome! Anything else I can help with?";
    }

    return "🤔 I can help with menu, orders, delivery, pricing, and more! What would you like to know?";
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const assistantResponse = {
        id: messages.length + 2,
        type: 'assistant',
        content: getAssistantResponse(inputMessage),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantResponse]);
      setIsTyping(false);

      if (!isOpen) {
        setHasUnread(true);
      }
    }, 1000 + Math.random() * 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl bg-gradient-to-r from-primary to-primary-light hover:scale-110 transition-transform"
          size="icon"
        >
          <MessageSquare className="w-6 h-6 text-white" />
          {hasUnread && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center animate-pulse">
              !
            </Badge>
          )}
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-light px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Sweet Assistant</h3>
                <p className="text-white/80 text-xs">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="h-[460px] overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-background/50 to-background">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-primary to-primary-light text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <span
                        className={`text-xs ${
                          message.type === 'user' ? 'text-white/70' : 'text-muted-foreground'
                        } mt-1 block`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-3 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border bg-background">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    size="icon"
                    className="bg-gradient-to-r from-primary to-primary-light"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingChatWidget;
