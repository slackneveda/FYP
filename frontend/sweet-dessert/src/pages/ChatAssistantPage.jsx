import React, {useState, useRef, useEffect} from "react"
import {
  Send,
  Sparkles,
  MessageSquare,
  Trash2,
  Copy,
  Check,
  Loader2,
  ShoppingCart,
  LogIn,
  CreditCard,
  ArrowDown,
  Key,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Badge} from "@/components/ui/badge"
import {toast} from "sonner"
import {useCart} from "@/contexts/CartProvider"
import {useAuth} from "@/contexts/AuthContext"
import {useNavigate} from "react-router-dom"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const API_BASE_URL = "http://localhost:8000/api"
const CHAT_STORAGE_KEY = "sweet-dessert-chat-history"
const DEFAULT_WELCOME_MESSAGE = {
  id: 1,
  type: "assistant",
  content:
    "👋 Hello! I'm your Sweet Dessert assistant. I can help you with information about our menu, orders, delivery options, ingredients, and anything else related to our desserts. How can I help you today?",
  timestamp: new Date(),
}

const loadPersistedMessages = () => {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (!raw) return [DEFAULT_WELCOME_MESSAGE]
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.length) return [DEFAULT_WELCOME_MESSAGE]
    return parsed.map(msg => ({
      ...msg,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      isStreaming: false,
    }))
  } catch {
    return [DEFAULT_WELCOME_MESSAGE]
  }
}

const ChatAssistantPage = () => {
  const [messages, setMessages] = useState(() => loadPersistedMessages())
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [chatSessionCart, setChatSessionCart] = useState([]) // eslint-disable-line no-unused-vars
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false)
  const [apiKey, setApiKey] = useState(() => {
    // Load API key from localStorage if available
    return localStorage.getItem("openrouter_api_key") || ""
  })
  const [apiProvider, setApiProvider] = useState(() => {
    return localStorage.getItem("chat_api_provider") || "openrouter"
  })
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const eventSourceRef = useRef(null)
  const {addItem} = useCart()
  const {user} = useAuth() // eslint-disable-line no-unused-vars
  const navigate = useNavigate()

  // Save API key to localStorage when it changes
  const handleApiKeyChange = value => {
    setApiKey(value)
    localStorage.setItem("openrouter_api_key", value)
  }

  const handleApiProviderChange = provider => {
    setApiProvider(provider)
    localStorage.setItem("chat_api_provider", provider)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
  }

  // Check if user is scrolled to bottom
  const handleScroll = () => {
    if (!messagesContainerRef.current) return

    const {scrollTop, scrollHeight, clientHeight} = messagesContainerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50 // 50px threshold

    setIsUserScrolledUp(!isAtBottom)
  }

  // Auto-scroll removed as per user request
  /*
  useEffect(() => {
    if (!isUserScrolledUp) {
      scrollToBottom()
    }
  }, [messages.length, isTyping])
  */

  useEffect(() => {
    // Fetch chat stats on mount
    fetchChatStats()

    // Store current ref value for cleanup
    const eventSource = eventSourceRef.current

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [])

  // Persist chat history across page refreshes
  useEffect(() => {
    try {
      const serializableMessages = messages
        .filter(msg => !msg.isStreaming)
        .slice(-60)
        .map(msg => ({
          ...msg,
          timestamp:
            msg.timestamp instanceof Date
              ? msg.timestamp.toISOString()
              : msg.timestamp,
        }))
      localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(serializableMessages)
      )
    } catch (error) {
      console.error("Error persisting chat history:", error)
    }
  }, [messages])

  const fetchChatStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/stats/`)
      const data = await response.json()
      if (data.success) {
        console.log("Chat system ready:", data.stats)
      }
    } catch (error) {
      console.error("Error fetching chat stats:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return

    const userMessage = inputMessage.trim()
    const historyPayload = messages
      .filter(
        msg =>
          (msg.type === "user" || msg.type === "assistant") &&
          msg.content &&
          !msg.isStreaming
      )
      .slice(-12)
      .map(msg => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
      }))
    setInputMessage("")

    // Add user message
    const userMessageObj = {
      id: messages.length + 1,
      type: "user",
      content: userMessage,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessageObj])
    setIsTyping(true)

    // Add placeholder for assistant response
    const assistantMessageId = messages.length + 2
    setMessages(prev => [
      ...prev,
      {
        id: assistantMessageId,
        type: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      },
    ])

    try {
      // Send message to backend with API key
      const response = await fetch(`${API_BASE_URL}/chat/stream/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message: userMessage,
          history: historyPayload,
          api_provider: apiProvider,
          api_key: apiKey || undefined, // Send API key if available
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      // Read the streaming response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ""
      let buffer = ""

      while (true) {
        const {done, value} = await reader.read()

        if (done) {
          setIsTyping(false)
          setMessages(prev => {
            const updated = [...prev]
            const msgIndex = updated.findIndex(m => m.id === assistantMessageId)
            if (msgIndex !== -1) {
              if (!updated[msgIndex].content?.trim()) {
                updated[msgIndex].content =
                  "I got that. Should I add this item to your cart?"
              }
              updated[msgIndex].isStreaming = false
            }
            return updated
          })
          break
        }

        buffer += decoder.decode(value, {stream: true})
        const lines = buffer.split("\n")

        // Keep the last line in the buffer if it's incomplete
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim()

            if (data === "[DONE]") {
              setIsTyping(false)
              setMessages(prev => {
                const updated = [...prev]
                const msgIndex = updated.findIndex(
                  m => m.id === assistantMessageId
                )
                if (msgIndex !== -1) {
                  if (!updated[msgIndex].content?.trim()) {
                    updated[msgIndex].content =
                      "I got that. Should I add this item to your cart?"
                  }
                  updated[msgIndex].isStreaming = false
                }
                return updated
              })
              break
            }

            try {
              const parsed = JSON.parse(data)

              // Handle auth required
              if (parsed.type === "auth_required") {
                setIsTyping(false)
                setMessages(prev => {
                  const updated = [...prev]
                  const msgIndex = updated.findIndex(
                    m => m.id === assistantMessageId
                  )
                  if (msgIndex !== -1) {
                    updated[msgIndex].content =
                      parsed.message || "Please sign in to continue."
                    updated[msgIndex].isStreaming = false
                  }
                  return updated
                })
                toast.error(parsed.message || "Please sign in to continue", {
                  action: {
                    label: "Sign In",
                    onClick: () => navigate("/signin"),
                  },
                  duration: 5000,
                })
                continue
              }

              // Handle checkout redirect
              if (parsed.type === "redirect_checkout") {
                setIsTyping(false)
                setMessages(prev => {
                  const updated = [...prev]
                  const msgIndex = updated.findIndex(
                    m => m.id === assistantMessageId
                  )
                  if (msgIndex !== -1) {
                    updated[msgIndex].content =
                      "Your order is ready. Click Go to Payment when you want to checkout."
                    updated[msgIndex].isStreaming = false
                  }
                  return updated
                })
                // Don't auto-redirect, show option in toast
                toast.success(
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Ready to checkout!</span>
                  </div>,
                  {
                    action: {
                      label: "Go to Payment",
                      onClick: () => navigate("/checkout"),
                    },
                    duration: 8000,
                  }
                )
                continue
              }

              // Handle product list
              if (parsed.type === "product_list") {
                console.log(
                  "Product list received:",
                  parsed.products?.length,
                  "products"
                )
                setMessages(prev => {
                  // Keep the streaming message for follow-up AI response
                  // Add a new product list message BEFORE the streaming message
                  const msgIndex = prev.findIndex(
                    m => m.id === assistantMessageId
                  )
                  const productListMessage = {
                    id: Date.now(),
                    type: "product_list",
                    products: parsed.products || [],
                    timestamp: new Date(),
                  }

                  if (msgIndex !== -1) {
                    // Insert product list before the streaming message
                    const updated = [...prev]
                    updated.splice(msgIndex, 0, productListMessage)
                    return updated
                  }
                  return [...prev, productListMessage]
                })
                continue
              }

              // Handle cart updates
              if (parsed.type === "cart_update") {
                // Add products to main cart context
                if (parsed.added_products) {
                  parsed.added_products.forEach(product => {
                    addItem({
                      id: Date.now() + Math.random(),
                      name: product.name,
                      price: parseFloat(product.price) || 0,
                      image: product.image || "/placeholder.jpg", // Use actual product image
                      quantity: product.quantity || 1,
                      category: product.category || "Dessert",
                    })
                  })

                  const productNames = parsed.added_products
                    .map(p => p.name)
                    .join(", ")
                  toast.success(
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Added {productNames} to cart!</span>
                    </div>,
                    {
                      duration: 4000,
                    }
                  )
                }
                continue // Continue to get AI confirmation message
              }

              // Handle chat content
              if (parsed.content) {
                accumulatedContent += parsed.content
                setMessages(prev => {
                  const updated = [...prev]
                  const msgIndex = updated.findIndex(
                    m => m.id === assistantMessageId
                  )
                  if (msgIndex !== -1) {
                    updated[msgIndex].content = accumulatedContent
                  }
                  return updated
                })
              }

              // Handle errors
              if (parsed.error) {
                throw new Error(parsed.error)
              }
            } catch (e) {
              if (e.message !== "Unexpected end of JSON input") {
                console.error("Error parsing stream data:", e)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setIsTyping(false)

      setMessages(prev => {
        const updated = [...prev]
        const msgIndex = updated.findIndex(m => m.id === assistantMessageId)
        if (msgIndex !== -1) {
          updated[msgIndex].content =
            "❌ Sorry, I encountered an error. Please try again."
          updated[msgIndex].isStreaming = false
        }
        return updated
      })

      toast.error("Failed to connect to chat assistant")
    }
  }

  const handleKeyPress = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        ...DEFAULT_WELCOME_MESSAGE,
        content: "Chat cleared! How can I help you today?",
        timestamp: new Date(),
      },
    ])
    setChatSessionCart([])
    localStorage.removeItem(CHAT_STORAGE_KEY)
    toast.success("Chat history cleared")
  }

  const copyMessage = (content, id) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    toast.success("Message copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const quickQuestions = [
    "What chocolate cakes do you have?",
    "Tell me about your brownies",
    "I want to order a dessert",
    "What are your prices?",
  ]

  const handleQuickQuestion = question => {
    setInputMessage(question)
  }

  return (
    <div className="min-h-screen bg-background py-6 sm:py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Sweet Dessert Assistant
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your personal guide to our delicious treats. Ask about menu items,
              ingredients, or track your order.
            </p>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          {/* Chat Header */}
          <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  Chat Assistant
                </h2>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      apiKey ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                  <p className="text-xs text-muted-foreground">
                    {apiKey
                      ? `Ready via ${
                          apiProvider === "cerebras" ? "Cerebras" : "OpenRouter"
                        }`
                      : "Setup required"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className={`text-muted-foreground hover:text-foreground hover:bg-muted h-9 w-9 ${
                  apiKey ? "" : "animate-pulse text-yellow-500"
                }`}
                title="Configure API Key"
              >
                <Key className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                className="text-muted-foreground hover:text-foreground hover:bg-muted h-9 w-9"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* API Key Input Panel */}
          {showApiKeyInput && (
            <div className="px-4 sm:px-6 py-3 bg-muted/50 border-b border-border">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">AI API Key</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={apiProvider === "openrouter" ? "default" : "outline"}
                  onClick={() => handleApiProviderChange("openrouter")}
                >
                  OpenRouter
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={apiProvider === "cerebras" ? "default" : "outline"}
                  onClick={() => handleApiProviderChange("cerebras")}
                >
                  Cerebras
                </Button>
              </div>
              <div className="mt-2 flex gap-2">
                <Input
                  type="password"
                  value={apiKey}
                  onChange={e => handleApiKeyChange(e.target.value)}
                  placeholder={
                    apiProvider === "cerebras"
                      ? "csk-..."
                      : "sk-or-v1-... (optional)"
                  }
                  className="flex-1 text-sm font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (apiKey) {
                      toast.success("API Key saved!")
                      setShowApiKeyInput(false)
                    } else {
                      toast.error("Please enter an API key")
                    }
                  }}
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use OpenRouter or Cerebras API key. OpenRouter keys from{" "}
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  openrouter.ai/keys
                </a>
              </p>
            </div>
          )}

          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="h-[500px] sm:h-[600px] overflow-y-auto p-4 sm:p-6 space-y-6 bg-background"
          >
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                {message.type === "product_list" ? (
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
                            <h4 className="font-semibold text-sm flex-1 pr-2">
                              {product.name}
                            </h4>
                            <Badge
                              variant="secondary"
                              className="text-xs shrink-0"
                            >
                              {product.category}
                            </Badge>
                          </div>
                          <p className="text-lg font-bold text-primary mb-2">
                            Rs.{" "}
                            {parseFloat(product.price).toLocaleString("en-PK", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
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
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-6 py-4 shadow-sm ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground ml-auto rounded-br-sm"
                        : "bg-card border border-border/60 rounded-bl-sm"
                    } group relative`}
                  >
                    <div
                      className={`text-sm sm:text-base leading-relaxed ${
                        message.type === "user"
                          ? "[&_p]:text-primary-foreground [&_strong]:text-primary-foreground [&_li]:text-primary-foreground [&_a]:text-primary-foreground [&_a]:underline"
                          : "prose prose-neutral dark:prose-invert max-w-none prose-p:leading-7 prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                      }`}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({node, ...props}) => (
                            <div className="overflow-x-auto my-2 rounded-lg border border-border bg-background/50">
                              <table className="w-full text-sm" {...props} />
                            </div>
                          ),
                          thead: ({node, ...props}) => (
                            <thead className="bg-muted" {...props} />
                          ),
                          th: ({node, ...props}) => (
                            <th
                              className="px-3 py-2 text-left font-semibold border-b border-border"
                              {...props}
                            />
                          ),
                          td: ({node, ...props}) => (
                            <td
                              className="px-3 py-2 border-b border-border last:border-0"
                              {...props}
                            />
                          ),
                          a: ({node, ...props}) => (
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium underline underline-offset-4 hover:opacity-80 transition-opacity"
                              {...props}
                            />
                          ),
                          code: ({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }) => {
                            return inline ? (
                              <code
                                className="bg-background/50 rounded px-1 py-0.5 font-mono text-xs border border-border/50"
                                {...props}
                              >
                                {children}
                              </code>
                            ) : (
                              <div className="bg-background/50 rounded-lg p-3 my-2 overflow-x-auto border border-border/50">
                                <code className="font-mono text-xs" {...props}>
                                  {children}
                                </code>
                              </div>
                            )
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                      {message.isStreaming && (
                        <span className="inline-block ml-1 align-text-bottom">
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1 sm:mt-2 gap-2">
                      <span
                        className={`text-xs ${
                          message.type === "user"
                            ? "text-white/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {message.content && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-5 w-5 sm:h-6 sm:w-6 opacity-0 group-hover:opacity-100 transition-opacity ${
                            message.type === "user"
                              ? "text-white hover:bg-white/20"
                              : ""
                          }`}
                          onClick={() =>
                            copyMessage(message.content, message.id)
                          }
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
              <div className="flex justify-start animate-fade-in">
                <div className="bg-card border border-border/60 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce delay-200"></div>
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
                    setIsUserScrolledUp(false)
                    scrollToBottom()
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
              <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-muted-foreground">
                Quick questions:
              </p>
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
          <div className="p-4 sm:p-6 border-t border-border bg-card/50 backdrop-blur-sm">
            <div className="flex gap-3 relative">
              <Input
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isTyping}
                className="flex-1 h-12 px-4 rounded-xl border-input bg-background shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="h-12 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
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
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-6 text-center hover:bg-muted/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Real-time AI responses with product knowledge
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center hover:bg-muted/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Smart Ordering</h3>
            <p className="text-sm text-muted-foreground">
              Add items to cart directly from chat
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center hover:bg-muted/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Natural Conversations</h3>
            <p className="text-sm text-muted-foreground">
              Chat naturally like talking to a friend
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatAssistantPage

