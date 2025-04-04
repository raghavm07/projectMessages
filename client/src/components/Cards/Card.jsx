import React, { useState, useEffect, useRef, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axios from "axios";
import { toPng } from "html-to-image";
import download from "downloadjs";
import {
  Edit2,
  Plus,
  ChevronDown,
  RefreshCw,
  Minus,
  Download,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GreetingCardSkeleton from "./CardSkeleton";
import { SketchPicker } from "react-color";
import { fontFamilies } from "../../constants.json";
import image from "../../assets/image.png";

const ItemType = {
  TEXT: "text",
};

const GreetingCard = () => {
  const { cardId } = useParams();

  const [title, setTitle] = useState("");
  const [textItems, setTextItems] = useState([]);
  const [cardBackground, setCardBackground] = useState("");
  const [greetTextColour, setGreetTextColour] = useState();
  const [greetBackgroundColour, setGreetBackgroundColour] = useState();
  const [cardHeight, setCardHeight] = useState(600);
  const [cardWidth, setCardWidth] = useState(800);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFont, setShowFont] = useState(false);
  const [showTextPicker, setShowTextPicker] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showBackgroundTextPicker, setShowBackgroundTextPicker] =
    useState(false);

  const containerRef = useRef(null);

  const API_BASE_URL = "http://localhost:5500/api";
  const loggedInEmployeeId = localStorage.getItem("employeeId");

  useEffect(() => {
    const fetchCardData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/cards/${cardId}`);
        const cardData = response.data;
        console.log("cardData", cardData);
        setTitle(cardData.cardTitle);
        setGreetTextColour(cardData.greetTextColour);
        setGreetBackgroundColour(cardData.greetBackgroundColour);
        setCardHeight(cardData.height || 600);
        setCardWidth(cardData.width || 800);
        setCardBackground(cardData.cardBackgroundUrl);
        setTextItems(cardData.greetings || []);
      } catch (error) {
        toast.error("Error fetching card data.", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCardData();
  }, [cardId]);

  const moveTextItem = (id, x, y) => {
    setTextItems((prev) =>
      prev.map((item) => (item.greetingId === id ? { ...item, x, y } : item))
    );

    const updatedItem = textItems.find((item) => item.greetingId === id);
    if (updatedItem) {
      const updatedData = { ...updatedItem, x, y };
      console.log("updatedData", updatedData);
      axios
        .put(`${API_BASE_URL}/greetings/${id}`, updatedData)
        // .then(() => toast.success("Position updated successfully."))
        .catch(() => toast.error("Failed to update position."));
    }
  };

  const handleSaveModal = () => {
    if (!modalData) return;
    console.log(modalData);
    const {
      greetingId,
      text,
      x,
      y,
      name,
      employeeId,
      isBold,
      isItalic,
      fontFamily,
      backgroundColor,
      textColor,
      rotation,
    } = modalData;
    console.log(x, y);
    if (greetingId) {
      // Edit existing greeting
      axios
        .put(`${API_BASE_URL}/greetings/${greetingId}`, {
          message: text,
          senderName: name,
          employeeId: employeeId,
          x,
          y,
          isBold,
          isItalic,
          fontFamily,
          backgroundColor,
          textColor,
          rotation,
        })
        .then(() => {
          setTextItems((prev) =>
            prev.map((item) =>
              item.greetingId === greetingId
                ? {
                    ...item,
                    message: text,
                    senderName: name,
                    employeeId: employeeId,
                    isBold,
                    isItalic,
                    fontFamily,
                    backgroundColor,
                    textColor,
                    rotation,
                  }
                : item
            )
          );
          toast.success("Greeting updated successfully.");
          setIsModalOpen(false);
          setShowTextPicker(false);
          setShowFont(false);
          setShowBackgroundTextPicker(false);
          setModalData({
            text: "",
            name: "",
            backgroundColor: "white",
            textColor: "black",
            rotation: 0,
            fontFamily: "inherit",
            isBold: false,
            isItalic: false,
          });
        })
        .catch(() => toast.error("Failed to update greeting."));
    } else {
      // Add new greeting
      const newGreeting = {
        cardId: cardId,
        message: text,
        senderName: name,
        x: x || 50,
        y: y || 50,
        employeeId: loggedInEmployeeId,
        isBold: isBold,
        isItalic: isItalic,
        fontFamily: fontFamily,
        backgroundColor: backgroundColor,
        textColor: textColor,
        rotation: rotation,
      };

      axios
        .post(`${API_BASE_URL}/greetings`, newGreeting)
        .then((response) => {
          setTextItems((prev) => [...prev, response.data.data]);
          toast.success("Greeting added successfully.");
          setIsModalOpen(false);
          setShowTextPicker(false);
          setShowFont(false);
          setShowBackgroundTextPicker(false);
          setModalData({
            text: "",
            name: "",
            backgroundColor: "white",
            textColor: "black",
            rotation: 0,
            fontFamily: "inherit",
            isBold: false,
            isItalic: false,
          });
        })
        .catch(() => toast.error("Failed to add greeting."));
    }
  };

  const DraggableTextItem = ({ item }) => {
    const [, drag] = useDrag({
      type: ItemType.TEXT,
      item: { id: item.greetingId },
    });

    return (
      <div
        ref={drag}
        className="absolute cursor-grab group"
        style={{
          left: `${item.x}px`,
          top: `${item.y}px`,
          color: item.textColor || greetTextColour,
          backgroundColor: item.backgroundColor || greetBackgroundColour,
          padding: "5px 10px",
          borderRadius: "5px",
          zIndex: 10,
          fontWeight: item.isBold ? "bold" : "lighter",
          fontStyle: item.isItalic ? "italic" : "normal",
          fontFamily: item.fontFamily,
          transform: `rotate(${item.rotation}deg)`,
        }}
      >
        <div className="flex flex-col">
          <span>{item.message}</span>
          <span className="text-sm mt-1">-{item.senderName}</span>
        </div>
        {loggedInEmployeeId === item.employeeId && (
          <button
            onClick={(e) => {
              console.log(loggedInEmployeeId);
              console.log(item.employeeId);
              console.log("Edit button clicked!");
              e.stopPropagation(); // Prevent parent click handlers.
              setModalData({
                x: item.x,
                y: item.y,
                text: item.message,
                name: item.senderName,
                greetingId: item.greetingId,
                employeeId: item.employeeId,
                isBold: item.isBold,
                isItalic: item.isItalic,
                fontFamily: item.fontFamily,
                backgroundColor: item.backgroundColor,
                textColor: item.textColor,
                rotation: item.rotation || 0,
              });
              setIsModalOpen(true);
            }}
            className="absolute top-0 right-0 bg-gray-700 hover:bg-gray-800 p-1 rounded-full hidden group-hover:block"
          >
            <Edit2 size={16} className="text-white" />
          </button>
        )}
      </div>
    );
  };

  const [, drop] = useDrop({
    accept: ItemType.TEXT,
    drop: (droppedItem, monitor) => {
      const offset = monitor.getSourceClientOffset();
      if (!containerRef.current || !offset) return;

      const rect = containerRef.current.getBoundingClientRect();
      let newX = Math.min(Math.max(0, offset.x - rect.left), cardWidth - 50);
      let newY = Math.min(Math.max(0, offset.y - rect.top), cardHeight - 20);

      moveTextItem(droppedItem.id, newX, newY);
    },
  });

  const startListening = (field) => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setModalData((prev) => ({
        ...prev,
        [field]: transcript,
      }));
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      alert("Error: " + event.error);
      toast.error(event.error);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <>
      {loading ? (
        <GreetingCardSkeleton />
      ) : (
        <DndProvider backend={HTML5Backend}>
          {/* header */}
          <div className="flex justify-around items-center w-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md  ">
            {/* Left: Preview Box */}
            <div className="bg-gray-300 rounded-md shadow-sm flex  p-1 w-1/5">
              <div
                className="text-center p-1 rounded-md w-full transition-transform duration-300 flex flex-col items-center justify-center"
                style={{
                  backgroundColor: modalData?.backgroundColor || "white",
                  color: modalData?.textColor || "black",
                  transform: `rotate(${modalData?.rotation || 0}deg)`,
                  fontFamily: modalData?.fontFamily || "inherit",
                  fontWeight: modalData?.isBold ? "bold" : "normal",
                  fontStyle: modalData?.isItalic ? "italic" : "normal",
                }}
              >
                <p className="text-lg text-center">
                  {modalData?.text || "Your message here..."}
                </p>
                <p className="text-sm mt-1 text-center">
                  - {modalData?.name || "Sender"}
                </p>
              </div>
            </div>

            {/* Right: Input Form */}
            <div className="w-2/3 flex items-center gap-3">
              <button
                onClick={() => {
                  startListening("text");
                }}
                className={`p-2 rounded-lg transition ${
                  isListening
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                🎤
              </button>

              <input
                type="text"
                className="p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Message"
                value={modalData?.text}
                onChange={(e) =>
                  setModalData({ ...modalData, text: e.target.value })
                }
              />
              <button
                onClick={() => {
                  startListening("name");
                }}
                className={`p-2 rounded-lg transition ${
                  isListening
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                🎤
              </button>
              <input
                type="text"
                className="p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sender"
                value={modalData?.name}
                onChange={(e) =>
                  setModalData({ ...modalData, name: e.target.value })
                }
              />

              {/* Formatting Controls */}
              <button
                onClick={() =>
                  setModalData({ ...modalData, isBold: !modalData?.isBold })
                }
                className={`p-2 rounded-lg transition ${
                  modalData?.isBold
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <strong>B</strong>
              </button>
              <button
                onClick={() =>
                  setModalData({ ...modalData, isItalic: !modalData?.isItalic })
                }
                className={`p-2 rounded-lg transition ${
                  modalData?.isItalic
                    ? "bg-blue-600 text-white italic"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <em>I</em>
              </button>
              <button
                onClick={() =>
                  setModalData({
                    ...modalData,
                    rotation: (modalData?.rotation || 0) - 10,
                  })
                }
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                ↺
              </button>
              <button
                onClick={() =>
                  setModalData({
                    ...modalData,
                    rotation: (modalData?.rotation || 0) + 10,
                  })
                }
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                ↻
              </button>

              {/* Font Picker */}
              <div
                className="p-2 border rounded-lg cursor-pointer bg-gray-200 hover:bg-gray-300"
                onClick={() => {
                  setShowFont(!showFont);
                  setShowTextPicker(false);
                  setShowBackgroundTextPicker(false);
                }}
              >
                F
              </div>

              {/* Color Pickers */}
              <div
                className="p-2 bg-gray-200 hover:bg-gray-300 cursor-pointer rounded-lg transition "
                onClick={() => {
                  setShowTextPicker(!showTextPicker);
                  setShowFont(false);
                  setShowBackgroundTextPicker(false);
                }}
              >
                T
              </div>

              <div
                className="p-2 bg-gray-200 hover:bg-gray-300 cursor-pointer rounded-lg transition"
                onClick={() => {
                  setShowBackgroundTextPicker(!showBackgroundTextPicker);
                  setShowFont(false);
                  setShowTextPicker(false);
                }}
              >
                BG
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setModalData({
                    text: "",
                    name: "",
                    backgroundColor: "white",
                    textColor: "black",
                    rotation: 0,
                    fontFamily: "inherit",
                    isBold: false,
                    isItalic: false,
                  });
                }}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
              >
                Save
              </button>
            </div>
          </div>
          {/* Font Dropdown */}
          {showFont && (
            <div className="absolute left-1/2 transform -translate-x-1/2 z-50 mt-2 bg-gray-200 shadow-lg p-3 rounded-lg border w-fit">
              <div className="flex justify-between items-center mb-2 ">
                <label className="text-xs font-medium">Font</label>
                <button onClick={() => setShowFont(false)}>❌</button>
              </div>
              <div className="w-40 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {fontFamilies.map((font) => (
                  <div
                    key={font.value}
                    className="p-2 text-xs hover:bg-blue-100 cursor-pointer"
                    style={{ fontFamily: font.value }}
                    onClick={() => {
                      setModalData({
                        ...modalData,
                        fontFamily: font.value,
                      });
                      setShowFont(false);
                    }}
                  >
                    {font.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text Color Picker */}
          {showTextPicker && (
            <div className="absolute left-1/2 transform -translate-x-1/2 z-50 mt-2 bg-gray-200 shadow-lg p-3 rounded-lg border w-fit">
              <div className="flex justify-between items-center mb-2 ">
                <label className="text-xs font-medium">Text Color</label>
                <button onClick={() => setShowTextPicker(false)}>❌</button>
              </div>
              <SketchPicker
                color={modalData?.textColor}
                onChange={(color) =>
                  setModalData({ ...modalData, textColor: color.hex })
                }
              />
            </div>
          )}

          {/* Background Color Picker */}
          {showBackgroundTextPicker && (
            <div className="absolute left-1/2 transform -translate-x-1/2 z-50 mt-2 bg-gray-200 shadow-lg p-3 rounded-lg border w-fit">
              <div className="flex justify-between items-center mb-2 ">
                <label className="text-xs font-medium">BG Color</label>
                <button onClick={() => setShowBackgroundTextPicker(false)}>
                  ❌
                </button>
              </div>
              <SketchPicker
                color={modalData?.backgroundColor}
                onChange={(color) =>
                  setModalData({
                    ...modalData,
                    backgroundColor: color.hex,
                  })
                }
              />
            </div>
          )}

          <div className="flex flex-col items-center space-y-6 bg-gradient-to-br from-indigo-500 to-purple-600 ">
            <div
              ref={(node) => {
                containerRef.current = node;
                drop(node);
              }}
              className="relative bg-white rounded-lg shadow-lg mt-2"
              style={{
                height: `${cardHeight}px`,
                width: `${cardWidth}px`,
                backgroundImage: `url(${image})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                setModalData({
                  text: "",
                  name: "",
                  x: x,
                  y: y,
                });
                setIsModalOpen(true);
              }}
            >
              {textItems.map((item) => (
                <DraggableTextItem key={item.greetingId} item={item} />
              ))}
            </div>
          </div>
        </DndProvider>
      )}
    </>
  );
};

export default GreetingCard;
