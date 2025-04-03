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
import { Menu, Transition } from "@headlessui/react";
import { HexColorPicker } from "react-colorful";
import { SketchPicker } from "react-color";
import { fontFamilies } from "../../constants.json";
import image from "../../assets/image.png";

const ItemType = {
  TEXT: "text",
};

const Card2 = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();

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
  const [showBackgroundTextPicker, setShowBackgroundTextPicker] =
    useState(false);
  const [isListening, setIsListening] = useState(false);
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
          setModalData(null);
        })
        .catch(() => toast.error("Failed to update greeting."))
        .finally(() => {
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
        });
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

    // const handleMouseDown = () => setIsRotating(true);
    // const handleMouseUp = () => setIsRotating(false);

    // const handleMouseDown = (e) => {
    //   e.stopPropagation(); // Prevents triggering other events.
    //   setIsRotating(item.greetingId); // Set the rotating item.
    // };

    // const handleMouseUp = (e) => {
    //   e.stopPropagation();
    //   setIsRotating(null); // Stop rotating.
    //   moveTextItem(item.greetingId, item.x, item.y, rotation); // Save rotation.
    // };

    // const handleMouseMove = (e) => {
    //   if (isRotating) {
    //     const rect = e.target.getBoundingClientRect();
    //     const centerX = rect.left + rect.width / 2;
    //     const centerY = rect.top + rect.height / 2;
    //     const angle =
    //       Math.atan2(e.clientY - centerY, e.clientX - centerX) *
    //       (180 / Math.PI);
    //     setRotation(angle);
    //   }
    // };

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
        // onMouseMove={handleMouseMove}
        // onMouseUp={handleMouseUp}
      >
        {/* <div
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="absolute top-0 left-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer hidden
          group-hover:block"
        >
          <RotateCcw size={16} className="text-white" />
        </div> */}
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

  const handleDownload = async () => {
    if (!containerRef.current) {
      toast.error("Unable to download the card.");
      return;
    }

    setDownloading(true);

    // Save original dimensions
    const originalWidth = containerRef.current.style.width;
    const originalHeight = containerRef.current.style.height;

    // Increase dimensions by 100px
    containerRef.current.style.width = `${
      containerRef.current.offsetWidth + 100
    }px`;
    containerRef.current.style.height = `${
      containerRef.current.offsetHeight + 100
    }px`;

    try {
      // Capture the updated size
      const image = await toPng(containerRef.current);

      // Reset to original dimensions
      containerRef.current.style.width = originalWidth;
      containerRef.current.style.height = originalHeight;

      download(image, `${title || "greeting-card"}.png`);
      toast.success("Card downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download the card.", error);
    } finally {
      // Ensure dimensions are reset in case of error
      containerRef.current.style.width = originalWidth;
      containerRef.current.style.height = originalHeight;
      setDownloading(false);
    }
  };

  const handleSizeDecrease = async () => {
    const newHeight = cardHeight - 100;
    const newWidth = cardWidth - 100;

    if (newHeight < 600 || newWidth < 800) {
      return toast.warn("Minimum height and width should be maintained");
    }

    setCardWidth(newWidth);
    setCardHeight(newHeight);

    try {
      await axios.put(`${API_BASE_URL}/cards/${cardId}`, {
        height: newHeight,
        width: newWidth,
      });
      toast.success("Card size updated successfully!");
    } catch (error) {
      toast.error("Error updating card size:", error);
    }
  };

  const handleSizeIncrease = async () => {
    if (cardHeight == 1100 || cardWidth == 1300) {
      return toast.warn("Height or Width is already increased to maximum");
    }

    const newHeight = cardHeight + 100;
    const newWidth = cardWidth + 100;

    setCardWidth(newWidth);
    setCardHeight(newHeight);

    try {
      await axios.put(`${API_BASE_URL}/cards/${cardId}`, {
        height: newHeight,
        width: newWidth,
      });
      toast.success("Card size updated successfully!");
    } catch (error) {
      toast.error("Error updating card size:", error);
    }
  };
  const handleResize = async () => {
    const newHeight = 600;
    const newWidth = 800;

    if (cardHeight == 600 || cardWidth == 800) {
      return toast.error("Minimum height and width is already applied");
    }

    setCardWidth(newWidth);
    setCardHeight(newHeight);

    try {
      await axios.put(`${API_BASE_URL}/cards/${cardId}`, {
        height: newHeight,
        width: newWidth,
      });
      toast.success("Card size updated successfully!");
    } catch (error) {
      toast.error("Error updating card size:", error);
    }
  };

  const startListening = () => {
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
      setModalData({ ...modalData, text: transcript });
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      alert("Error: " + event.error);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center w-full p-4 bg-black shadow-md rounded-lg">
        {/* Left: Preview Box */}
        <div className="bg-gray-300 rounded-lg shadow-lg flex items-center justify-center p-5 w-1/3">
          <div
            className="text-center p-5 rounded-md w-full transition-transform duration-300 flex flex-col items-center justify-center"
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
            onClick={startListening}
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
            className="p-2 bg-gray-200 hover:bg-gray-300 cursor-pointer rounded-lg transition"
            style={{ backgroundColor: modalData?.textColor }}
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
            style={{ backgroundColor: modalData?.backgroundColor }}
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
            onClick={() => setIsModalOpen(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>
      </div>
      {/* Font Dropdown */}
      {showFont && (
        <div className="absolute z-50 mt-2 bg-gray-200 shadow-lg p-3 rounded-lg border">
          <div className="flex justify-between items-center mb-2">
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
        <div className="absolute z-50 mt-2 bg-gray-200 shadow-lg p-3 rounded-lg">
          <label className="text-xs font-medium">Text Color</label>
          <button onClick={() => setShowTextPicker(false)}>❌</button>
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
        <div className="absolute z-50 mt-2 bg-gray-200 shadow-lg p-3 rounded-lg">
          <label className="text-xs font-medium">BG Color</label>
          <button onClick={() => setShowBackgroundTextPicker(false)}>❌</button>
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

      {/* Body */}
      <div className="p-4 bg-gray-100 text-gray-700">
        This is the card body. You can add any content here.
      </div>
    </div>
  );
};

export default Card2;
