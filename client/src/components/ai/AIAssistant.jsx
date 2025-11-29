import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Send, Bot, User, Loader2, X, MessageSquare } from "lucide-react";
import api from "@/api/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ItineraryPreview from "./ItineraryPreview";

export default function AIAssistant({ isOpen, onToggle }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Tono, your AI travel partner. I can help you create itineraries, invoices, or manage bookings. Try saying 'Create a 5-day trip to Paris'.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send conversation history for context
      const conversationHistory = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));

      const response = await api.post('/ai/chat', {
        message: userMessage.content,
        conversation_history: conversationHistory
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: response.data.timestamp || new Date().toISOString(),
        action: response.data.action,
        data: response.data.raw // Store raw data for UI rendering if needed
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle specific actions with toasts or additional UI cues
      if (response.data.action === 'itinerary_created' || response.data.action === 'itinerary_updated') {
        toast.success(response.data.action === 'itinerary_created' ? "Itinerary Created!" : "Itinerary Updated!");
      } else if (response.data.action === 'invoice_created') {
        toast.success("Invoice Created!");
      }

    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again.",
          timestamp: new Date().toISOString(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[400px] shadow-2xl rounded-2xl overflow-hidden"
          >
            <Card className="h-[600px] flex flex-col border-0 bg-white/90 backdrop-blur-xl ring-1 ring-slate-900/5">
              <CardHeader className="border-b bg-white/50 backdrop-blur-md p-4 flex flex-row items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                      Tono AI
                    </CardTitle>
                    <p className="text-xs text-slate-500 font-medium">Travel Assistant • Online</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onToggle(false)} className="h-8 w-8 rounded-full hover:bg-slate-100">
                  <X className="w-4 h-4 text-slate-500" />
                </Button>
              </CardHeader>

              <CardContent className="flex-1 p-0 overflow-hidden relative bg-slate-50/50">
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                  <div className="space-y-6 pb-4">
                    <AnimatePresence initial={false}>
                      {messages.map((msg, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm shrink-0 mt-1">
                              <Bot className="w-4 h-4 text-indigo-600" />
                            </div>
                          )}

                          <div className={`max-w-[85%] space-y-1 ${msg.role === 'user' ? 'items-end flex flex-col' : 'items-start'}`}>
                            <div
                              className={`p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-none'
                                : msg.isError
                                  ? 'bg-red-50 text-red-600 border border-red-100 rounded-tl-none'
                                  : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                                }`}
                            >
                              {(() => {
                                // Check if content is JSON string
                                let isJson = false;
                                let jsonContent = null;
                                try {
                                  if (msg.content.trim().startsWith('{') && msg.content.trim().endsWith('}')) {
                                    jsonContent = JSON.parse(msg.content);
                                    // Basic validation to see if it looks like an itinerary
                                    if (jsonContent.destination || jsonContent.title || jsonContent.days) {
                                      isJson = true;
                                    }
                                  }
                                } catch (e) {
                                  // Not JSON
                                }

                                if (isJson) {
                                  return <ItineraryPreview data={jsonContent} />;
                                }

                                return msg.content;
                              })()}
                            </div>

                            {/* Render Action Cards if available */}
                            {(msg.action === 'itinerary_created' || msg.action === 'itinerary_generated') && (msg.data || msg.content) && (
                              <ItineraryPreview data={msg.data || msg.content} />
                            )}

                            <span className="text-[10px] text-slate-400 px-1">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shadow-sm shrink-0 mt-1">
                              <User className="w-4 h-4 text-slate-600" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3 justify-start"
                      >
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm shrink-0">
                          <Bot className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                            className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                          />
                        </div>
                      </motion.div>
                    )}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                {/* Quick Actions */}
                <div className="absolute bottom-20 left-4 right-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <Button variant="secondary" size="sm" className="whitespace-nowrap text-xs bg-white/80 backdrop-blur shadow-sm border border-slate-200" onClick={() => setInput("Create a 3-day trip to Tokyo")}>
                    🇯🇵 Trip to Tokyo
                  </Button>
                  <Button variant="secondary" size="sm" className="whitespace-nowrap text-xs bg-white/80 backdrop-blur shadow-sm border border-slate-200" onClick={() => setInput("Create invoice for John Doe for $500")}>
                    📄 Invoice $500
                  </Button>
                </div>
              </CardContent>

              <div className="p-4 bg-white border-t">
                <div className="relative flex items-center">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask Tono to plan a trip..."
                    className="pr-12 py-6 rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                    disabled={isLoading}
                  />
                  <Button
                    size="icon"
                    className={`absolute right-1.5 w-9 h-9 rounded-lg transition-all ${input.trim() ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'}`}
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onToggle(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${isOpen
          ? 'bg-slate-800 text-white rotate-90'
          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-500/30'
          }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
