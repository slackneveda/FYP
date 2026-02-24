import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Minimize2, Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartProvider';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_BASE_URL = 'http://localhost:8000/api';

const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "👋 Hi! I'm your Sweet Dessert AI assistant. Ask me anything about our menu, prices, or place an order!",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);
  const { addItem } = useCart();

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    const userMessageObj = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessageObj]);
    setIsTyping(true);

    const assistantMessageId = Date.now() + 1;
    setMessages(prev => [
      ...prev,
      {
        id: assistantMessageId,
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      },
    ]);

    try {
      const apiKey = localStorage.getItem('openrouter_api_key') || undefined;

      const response = await fetch(`${API_BASE_URL}/chat/stream/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage,
          api_key: apiKey,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          setIsTyping(false);
          setMessages(prev => {
            const updated = [...prev];
            const idx = updated.findIndex(m => m.id === assistantMessageId);
            if (idx !== -1) updated[idx].isStreaming = false;
            return updated;
          });
          if (!isOpen) setHasUnread(true);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            setIsTyping(false);
            setMessages(prev => {
              const updated = [...prev];
              const idx = updated.findIndex(m => m.id === assistantMessageId);
              if (idx !== -1) updated[idx].isStreaming = false;
              return updated;
            });
            if (!isOpen) setHasUnread(true);
            break;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'auth_required') {
              setIsTyping(false);
              setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(m => m.id === assistantMessageId);
                if (idx !== -1) {
                  updated[idx].content = parsed.message || 'Please sign in to continue.';
                  updated[idx].isStreaming = false;
                }
                return updated;
              });
              continue;
            }

            if (parsed.type === 'cart_update' && parsed.added_products) {
              parsed.added_products.forEach(product => {
                addItem({
                  id: Date.now() + Math.random(),
                  name: product.name,
                  price: parseFloat(product.price) || 0,
                  image: product.image || '/placeholder.jpg',
                  quantity: product.quantity || 1,
                  category: product.category || 'Dessert',
                });
              });
              const names = parsed.added_products.map(p => p.name).join(', ');
              toast.success(`Added ${names} to cart!`);
              continue;
            }

            if (parsed.type === 'redirect_checkout') {
              toast.success('Ready to checkout!', {
                action: { label: 'Go to Payment', onClick: () => window.location.href = '/checkout' },
                duration: 8000,
              });
              continue;
            }

            // Ignore product_list in widget — keep it compact
            if (parsed.type === 'product_list') continue;

            if (parsed.content) {
              accumulatedContent += parsed.content;
              setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(m => m.id === assistantMessageId);
                if (idx !== -1) updated[idx].content = accumulatedContent;
                return updated;
              });
            }

            if (parsed.error) throw new Error(parsed.error);
          } catch (e) {
            if (e.message !== 'Unexpected end of JSON input') {
              console.error('Error parsing stream:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      setMessages(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(m => m.id === assistantMessageId);
        if (idx !== -1) {
          updated[idx].content = '❌ Sorry, I encountered an error. Please try again.';
          updated[idx].isStreaming = false;
        }
        return updated;
      });
    }
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
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 animate-pulse" />
          )}
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[550px]'
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
                <p className="text-white/80 text-xs">AI-powered &bull; No login needed</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link to="/chat-assistant" onClick={() => setIsOpen(false)}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  title="Open full AI chat"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
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
              <div className="h-[420px] overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-background/50 to-background">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-primary to-primary-light text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <div
                        className={
                          message.type === 'user'
                            ? 'leading-relaxed [&_p]:mb-1 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5'
                            : 'prose prose-sm max-w-none leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5 [&_a]:text-primary [&_a]:underline [&_code]:bg-background [&_code]:px-1 [&_code]:rounded [&_code]:text-xs'
                        }
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                        {message.isStreaming && (
                          <span className="inline-block ml-1 align-text-bottom">
                            <Loader2 className="w-3 h-3 animate-spin inline" />
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs mt-1 block ${
                          message.type === 'user' ? 'text-white/70' : 'text-muted-foreground'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && !messages.some(m => m.isStreaming) && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-3 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
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
                    placeholder="Ask me anything..."
                    disabled={isTyping}
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    size="icon"
                    className="bg-gradient-to-r from-primary to-primary-light"
                  >
                    {isTyping ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
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
