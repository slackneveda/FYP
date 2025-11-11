import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Trash2, Copy, Check, Loader2, ShoppingCart, LogIn, CreditCard, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartProvider';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000/api';

const ChatAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "👋 Hello! I'm your Sweet Dessert assistant. I can help you with information about our menu, orders, delivery options, ingredients, and anything else related to our desserts. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [chatSessionCart, setChatSessionCart] = useState([]); // eslint-disable-line no-unused-vars
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const eventSourceRef = useRef(null);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth(); // eslint-disable-line no-unused-vars
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check if user is scrolled to bottom
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold
    
    setIsUserScrolledUp(!isAtBottom);
  };

  // Only auto-scroll if user is already at the bottom
  useEffect(() => {
    if (!isUserScrolledUp) {
      scrollToBottom();
    }
  }, [messages, isTyping, isUserScrolledUp]);

  useEffect(() => {
    // Fetch chat stats on mount
    fetchChatStats();
    
    // Store current ref value for cleanup
    const eventSource = eventSourceRef.current;
    
    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const fetchChatStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/stats/`);
      const data = await response.json();
      if (data.success) {
        console.log('Chat system ready:', data.stats);
      }
    } catch (error) {
      console.error('Error fetching chat stats:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message
    const userMessageObj = {
      id: messages.length + 1,
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessageObj]);
    setIsTyping(true);

    // Add placeholder for assistant response
    const assistantMessageId = messages.length + 2;
    setMessages((prev) => [
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
      // Send message to backend
      const response = await fetch(`${API_BASE_URL}/chat/stream/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Read the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          setIsTyping(false);
          setMessages((prev) => {
            const updated = [...prev];
            const msgIndex = updated.findIndex(m => m.id === assistantMessageId);
            if (msgIndex !== -1) {
              updated[msgIndex].isStreaming = false;
            }
            return updated;
          });
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            
            if (data === '[DONE]') {
              setIsTyping(false);
              setMessages((prev) => {
                const updated = [...prev];
                const msgIndex = updated.findIndex(m => m.id === assistantMessageId);
                if (msgIndex !== -1) {
                  updated[msgIndex].isStreaming = false;
                }
                return updated;
              });
              break;
            }

            try {
              const parsed = JSON.parse(data);
              
              // Handle auth required
              if (parsed.type === 'auth_required') {
                setIsTyping(false);
                setMessages((prev) => {
                  const updated = [...prev];
                  const msgIndex = updated.findIndex(m => m.id === assistantMessageId);
                  if (msgIndex !== -1) {
                    updated[msgIndex].isStreaming = false;
                  }
                  return updated;
                });
                toast.error(parsed.message || 'Please sign in to continue', {
                  action: {
                    label: 'Sign In',
                    onClick: () => navigate('/signin')
                  },
                  duration: 5000
                });
                continue;
              }
              
              // Handle checkout redirect
              if (parsed.type === 'redirect_checkout') {
                setIsTyping(false);
                setMessages((prev) => {
                  const updated = [...prev];
                  const msgIndex = updated.findIndex(m => m.id === assistantMessageId);
                  if (msgIndex !== -1) {
                    updated[msgIndex].isStreaming = false;
                  }
                  return updated;
                });
                // Don't auto-redirect, show option in toast
                toast.success(
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Ready to checkout!</span>
                  </div>,
                  {
                    action: {
                      label: 'Go to Payment',
                      onClick: () => navigate('/checkout')
                    },
                    duration: 8000
                  }
                );
                continue;
              }
              
              // Handle product list
              if (parsed.type === 'product_list') {
                setIsTyping(false);
                setMessages((prev) => {
                  // Remove the streaming placeholder
                  const filtered = prev.filter(m => m.id !== assistantMessageId);
                  // Add the product list message
                  const productListMessage = {
                    id: Date.now(),
                    type: 'product_list',
                    products: parsed.products,
                    timestamp: new Date(),
                  };
                  return [...filtered, productListMessage];
                });
                continue;
              }
              
              // Handle cart updates
              if (parsed.type === 'cart_update') {
                // Add products to main cart context
                if (parsed.added_products) {
                  parsed.added_products.forEach((product) => {
                    addItem({
                      id: Date.now() + Math.random(),
                      name: product.name,
                      price: parseFloat(product.price) || 0,
                      image: product.image || '/placeholder.jpg',  // Use actual product image
                      quantity: 1,
                      category: product.category || 'Dessert',
                    });
                  });
                  
                  const productNames = parsed.added_products.map(p => p.name).join(', ');
                  toast.success(
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Added {productNames} to cart!</span>
                    </div>,
                    {
                      duration: 4000
                    }
                  );
                }
                continue; // Continue to get AI confirmation message
              }
              
              // Handle chat content
              if (parsed.content) {
                accumulatedContent += parsed.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  const msgIndex = updated.findIndex(m => m.id === assistantMessageId);
                  if (msgIndex !== -1) {
                    updated[msgIndex].content = accumulatedContent;
                  }
                  return updated;
                });
              }
              
              // Handle errors
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              if (e.message !== 'Unexpected end of JSON input') {
                console.error('Error parsing stream data:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      setMessages((prev) => {
        const updated = [...prev];
        const msgIndex = updated.findIndex(m => m.id === assistantMessageId);
        if (msgIndex !== -1) {
          updated[msgIndex].content = '❌ Sorry, I encountered an error. Please try again.';
          updated[msgIndex].isStreaming = false;
        }
        return updated;
      });
      
      toast.error('Failed to connect to chat assistant');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'assistant',
        content: "👋 Chat cleared! How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    setChatSessionCart([]);
    toast.success('Chat history cleared');
  };

  const copyMessage = (content, id) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success('Message copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickQuestions = [
    "What chocolate cakes do you have?",
    "Tell me about your brownies",
    "I want to order a dessert",
    "What are your prices?",
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-4 sm:py-8">
      <div className="container mx-auto px-2 sm:px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-4 sm:mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-primary to-primary-light mb-3 sm:mb-4 animate-pulse">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-dessert-caramel to-primary-light bg-clip-text text-transparent">
            Sweet Dessert Assistant
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            Ask me anything about our desserts, orders, or services!
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-2xl border border-border overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary to-primary-light px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-sm sm:text-base">Chat Assistant</h2>
                <p className="text-white/80 text-xs sm:text-sm">Always here to help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9"
              title="Clear chat"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="h-[400px] sm:h-[500px] md:h-[550px] overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 bg-gradient-to-b from-background/50 to-background"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
              >
                {message.type === 'product_list' ? (
                  // Product List Display
                  <div className="w-full max-w-4xl bg-muted border border-border rounded-xl p-4">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                      Available Products
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {message.products.map((product, idx) => (
                        <div
                          key={idx}
                          className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-sm flex-1 pr-2">{product.name}</h4>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {product.category}
                            </Badge>
                          </div>
                          <p className="text-lg font-bold text-primary mb-2">
                            Rs. {parseFloat(product.price).toLocaleString('en-PK', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </p>
                          {product.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Regular Message Display
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-primary to-primary-light text-white'
                        : 'bg-muted text-foreground border border-border'
                    } group relative`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm sm:text-base">
                      {message.content}
                      {message.isStreaming && (
                        <Loader2 className="inline-block w-3 h-3 sm:w-4 sm:h-4 ml-2 animate-spin" />
                      )}
                    </p>
                    <div className="flex items-center justify-between mt-1 sm:mt-2 gap-2">
                      <span
                        className={`text-xs ${
                          message.type === 'user' ? 'text-white/70' : 'text-muted-foreground'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {message.content && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-5 w-5 sm:h-6 sm:w-6 opacity-0 group-hover:opacity-100 transition-opacity ${
                            message.type === 'user' ? 'text-white hover:bg-white/20' : ''
                          }`}
                          onClick={() => copyMessage(message.content, message.id)}
                        >
                          {copiedId === message.id ? (
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          ) : (
                            <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && !messages.some(m => m.isStreaming) && (
              <div className="flex justify-start animate-slide-up">
                <div className="bg-muted rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 border border-border">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
            
            {/* Scroll to Bottom Button - appears when user scrolls up */}
            {isUserScrolledUp && (
              <div className="sticky bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                <Button
                  onClick={() => {
                    setIsUserScrolledUp(false);
                    scrollToBottom();
                  }}
                  className="pointer-events-auto bg-primary hover:bg-primary/90 text-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2 animate-slide-up"
                  size="sm"
                >
                  <ArrowDown className="w-4 h-4" />
                  New messages
                </Button>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-border bg-muted/30">
              <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-muted-foreground">Quick questions:</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {quickQuestions.map((question, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-white transition-colors px-2 py-1 sm:px-3 text-xs sm:text-sm"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 sm:p-4 border-t border-border bg-background">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about our desserts, prices, or place an order..."
                disabled={isTyping}
                className="flex-1 rounded-lg sm:rounded-xl border-2 focus:border-primary text-sm sm:text-base"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="rounded-lg sm:rounded-xl px-3 sm:px-6 bg-gradient-to-r from-primary to-primary-light hover:opacity-90 text-sm sm:text-base"
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-2" />
                )}
                <span className="hidden sm:inline">Send</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send • Powered by AI with real product knowledge 🤖
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-4 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 text-center hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1 text-sm sm:text-base">AI-Powered</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Real-time AI responses with product knowledge</p>
          </div>
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 text-center hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1 text-sm sm:text-base">Smart Ordering</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Add items to cart directly from chat</p>
          </div>
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 text-center hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1 text-sm sm:text-base">Natural Conversations</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Chat naturally like talking to a friend</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistantPage;
