import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const existingIdsRef = useRef(new Set()); // Use Set for fast lookups
  const isInitialFetchRef = useRef(true); // Tracks if the initial fetch is complete
  const latestMessageRef = useRef(null); // Reference to the latest message
  const BASE_URL = "http://localhost:5500/api";

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/messages`);
        const newMessages = response.data || [];
        addNewMessages(newMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to fetch messages.");
      }
    };

    const interval = setInterval(fetchMessages, 1000); // Fetch every 1 minute
    fetchMessages(); // Initial fetch
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const addNewMessages = (newMessages) => {
    const newEntries = newMessages.filter(
      (msg) => !existingIdsRef.current.has(msg.id)
    );

    if (newEntries.length > 0) {
      // Update state
      setMessages((prevMessages) => [...prevMessages, ...newEntries]);

      // Update ref
      newEntries.forEach((msg) => existingIdsRef.current.add(msg.id));

      // Show notification only if not the initial fetch
      if (!isInitialFetchRef.current) {
        toast.success(`🎉 ${newEntries.length} New Wishes Added!`, {
          onClick: () => handleToastClick(),
        });
      }
    }

    // Mark initial fetch as complete
    isInitialFetchRef.current = false;
  };

  const handleToastClick = () => {
    if (latestMessageRef.current) {
      latestMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-red-400">
        <img
          src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmZiemhyZDZndjNqdmJkZWJtZHdhY2x1ZTFyd3A2cWV4cjR5d2tlOSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/6WFScxN6fi95z3YVQD/giphy.gif"
          alt="Celebration GIF"
          className="w-3/4 max-w-md rounded-lg shadow-lg border-4 border-white"
        />
        <p className="text-3xl font-bold text-white mt-4 animate-pulse">
          Celebrate with Us!
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 bg-gradient-to-br from-blue-50 to-blue-100">
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">
          Messages
        </h2>
        <div className="h-[75%] overflow-y-auto rounded-md shadow-inner p-4 bg-white border border-blue-200">
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  ref={index === messages.length - 1 ? latestMessageRef : null}
                  id={`message-${msg.id}`}
                  key={msg.id}
                  className="bg-blue-100 shadow rounded-md p-4"
                >
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">{msg.senderName}:</span>{" "}
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-sm">
              No messages available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
