import { useState, useEffect, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import chatService from "../services/chatService";
import {
  FaCommentAlt, FaPaperPlane, FaSpinner, FaUser, FaHome,
  FaMapMarkerAlt, FaRupeeSign, FaInfoCircle, FaArrowLeft,
} from "react-icons/fa";

// Fallback conversation
const DEMO_CONVERSATIONS = [
  {
    id: "demo-conv-1",
    listing: {
      id: "demo-listing-1",
      title: "Premium Cozy Studio Apartment",
      location: "Koramangala, Bangalore",
      rent: 14000
    },
    otherUser: {
      id: "demo-owner-1",
      name: "Rajesh Kumar",
      email: "rajesh@demo.com"
    },
    lastMessage: {
      id: "demo-msg-2",
      content: "Yes, the room is available for visits this weekend! Let me know what time works for you.",
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
];

const DEMO_MESSAGES = [
  {
    id: "demo-msg-1",
    content: "Hi Rajesh, I saw your studio apartment listing on RentMate and I'm very interested. Is it still available?",
    senderId: "current-user-id", // Will be matched dynamically
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: "demo-msg-2",
    content: "Yes, the room is available for visits this weekend! Let me know what time works for you.",
    senderId: "demo-owner-1",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
];

export default function ChatPage() {
  const socket = useSocket();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // Selected conversation object
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [error, setError] = useState("");
  const [isDemo, setIsDemo] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to message bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping]);

  // Load conversations list
  useEffect(() => {
    const fetchConvs = async () => {
      try {
        const res = await chatService.getConversations();
        if (res.success && res.data.length > 0) {
          setConversations(res.data);
          setIsDemo(false);
        } else {
          setConversations(DEMO_CONVERSATIONS);
          setIsDemo(true);
        }
      } catch (err) {
        setConversations(DEMO_CONVERSATIONS);
        setIsDemo(true);
      } finally {
        setLoadingConvs(false);
      }
    };
    fetchConvs();
  }, []);

  // Load messages when active chat changes
  useEffect(() => {
    if (!activeChat) return;

    if (activeChat.id.startsWith("demo-")) {
      // Map mock senderId to actual user.id so it displays on the correct side
      const mappedMsgs = DEMO_MESSAGES.map(msg => ({
        ...msg,
        senderId: msg.senderId === "current-user-id" ? (user?.id || "my-id") : msg.senderId
      }));
      setMessages(mappedMsgs);
      return;
    }

    const fetchMsgs = async () => {
      setLoadingMsgs(true);
      setError("");
      try {
        const res = await chatService.getMessages(activeChat.id);
        if (res.success) {
          setMessages(res.data);
        }
      } catch (err) {
        setError("Failed to load message history.");
      } finally {
        setLoadingMsgs(false);
      }
    };

    fetchMsgs();

    // Join the Socket.IO room for this conversation
    if (socket) {
      socket.emit("join_room", { interestId: activeChat.id });
    }

    // Reset typing status on chat switch
    setOtherUserTyping(false);
  }, [activeChat, socket, user]);

  // Setup Socket listeners for real-time messages & typing indicators
  useEffect(() => {
    if (!socket || isDemo) return;

    const handleReceiveMessage = (msg) => {
      if (activeChat && msg.interestId === activeChat.id) {
        setMessages((prev) => [...prev, msg]);
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === msg.interestId) {
            return {
              ...conv,
              lastMessage: msg,
              updatedAt: msg.createdAt,
            };
          }
          return conv;
        }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    };

    const handleTypingStatus = ({ userId, isTyping }) => {
      if (activeChat && userId === activeChat.otherUser.id) {
        setOtherUserTyping(isTyping);
      }
    };

    const handleErrorMessage = ({ message }) => {
      setError(message);
      setTimeout(() => setError(""), 5000);
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing_status", handleTypingStatus);
    socket.on("error_message", handleErrorMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing_status", handleTypingStatus);
      socket.off("error_message", handleErrorMessage);
    };
  }, [socket, activeChat, isDemo]);

  // Handle typing status notification
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!socket || !activeChat || isDemo) return;

    socket.emit("typing", { interestId: activeChat.id, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { interestId: activeChat.id, isTyping: false });
    }, 1500);
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    if (isDemo) {
      // Simulate chat reply in demo mode
      const userMsg = {
        id: `mock-msg-${Date.now()}`,
        content: newMessage,
        senderId: user?.id || "my-id",
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, userMsg]);
      setNewMessage("");

      // Trigger typing indicator and reply after 1.5 seconds
      setOtherUserTyping(true);
      setTimeout(() => {
        setOtherUserTyping(false);
        const replyMsg = {
          id: `mock-reply-${Date.now()}`,
          content: "Thanks for the details! I will coordinate with you. (Demo Mode Auto-Reply)",
          senderId: activeChat.otherUser.id,
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, replyMsg]);
      }, 2000);
      return;
    }

    if (!socket) return;

    socket.emit("send_message", {
      interestId: activeChat.id,
      receiverId: activeChat.otherUser.id,
      content: newMessage,
    });

    socket.emit("typing", { interestId: activeChat.id, isTyping: false });
    setNewMessage("");
  };

  if (loadingConvs) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <FaSpinner className="animate-spin text-2xl text-violet-600" />
        <p className="text-sm font-semibold">Loading chat portal...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden flex h-[580px] w-full font-sans shadow-sm">
      {/* Conversation Sidebar */}
      <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/40 ${activeChat ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-base">
            <FaCommentAlt className="text-violet-600 text-sm" /> Chats {isDemo && <span className="text-[9px] px-1.5 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-650 rounded font-semibold ml-auto">Demo Mode</span>}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {conversations.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-400 text-xs flex flex-col gap-2 items-center justify-center">
              <FaCommentAlt className="text-2xl opacity-20" />
              <p>No active chats. Chat opens once a tenant interest request is accepted!</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveChat(conv)}
                className={`w-full text-left p-3 rounded-xl transition flex flex-col gap-1 ${
                  activeChat?.id === conv.id
                    ? "bg-violet-50 border border-violet-100 text-slate-800"
                    : "hover:bg-slate-50 text-slate-500"
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="font-bold text-sm text-slate-800 truncate pr-2">{conv.otherUser.name}</span>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                  </span>
                </div>
                <div className="text-xs font-semibold text-violet-600 truncate flex items-center gap-1">
                  <FaHome className="text-[10px]" /> {conv.listing.title}
                </div>
                {conv.lastMessage ? (
                  <p className="text-xs text-slate-500 truncate">{conv.lastMessage.content}</p>
                ) : (
                  <p className="text-xs text-slate-400 italic">No messages yet</p>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message Window */}
      <div className={`flex-1 flex flex-col bg-slate-50/10 ${!activeChat ? "hidden md:flex items-center justify-center p-6 text-slate-400 text-sm" : "flex"}`}>
        {!activeChat ? (
          <div className="flex flex-col items-center gap-2">
            <FaCommentAlt className="text-4xl opacity-20 text-violet-600" />
            <p className="font-bold text-slate-500">Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            {/* Active Header */}
            <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white shadow-sm">
              <button onClick={() => setActiveChat(null)} className="md:hidden text-slate-500 hover:text-slate-700 mr-1">
                <FaArrowLeft />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/10">
                {activeChat.otherUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-slate-800 text-sm truncate">{activeChat.otherUser.name}</h4>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1 font-semibold">
                  <FaMapMarkerAlt className="text-violet-500 text-[10px]" /> {activeChat.listing.title} · <FaRupeeSign className="text-emerald-600 text-[10px]" />₹{activeChat.listing.rent.toLocaleString()}/mo
                </p>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0 bg-slate-50/50">
              {loadingMsgs ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-xs gap-2">
                  <FaSpinner className="animate-spin text-sm text-violet-600" /> Loading messages...
                </div>
              ) : (
                <>
                  {messages.length === 0 && (
                    <div className="flex items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 gap-2 max-w-sm mx-auto mt-4 shadow-sm">
                      <FaInfoCircle className="text-violet-600 text-sm" />
                      <span>Introduce yourself and discuss room availability or move-in preferences.</span>
                    </div>
                  )}
                  {messages.map((msg) => {
                    const isOwn = msg.senderId === user?.id || msg.senderId === "my-id";
                    return (
                      <div key={msg.id} className={`flex flex-col max-w-[75%] ${isOwn ? "self-end items-end" : "self-start items-start"}`}>
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${isOwn ? "bg-violet-600 text-white rounded-tr-none shadow-md shadow-violet-600/10" : "bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm"}`}>
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 px-1 font-medium">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                  {otherUserTyping && (
                    <div className="self-start bg-white text-slate-500 px-3 py-2 rounded-2xl rounded-tl-none text-xs border border-slate-200 shadow-sm flex items-center gap-1.5 animate-pulse font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-200" />
                      <span>is typing...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-violet-500 focus:bg-white text-slate-800 rounded-xl py-3 px-4 outline-none text-sm font-bold"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-violet-600 hover:bg-violet-500 text-white p-3 rounded-xl transition disabled:opacity-40 flex items-center justify-center shrink-0 shadow-sm"
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
