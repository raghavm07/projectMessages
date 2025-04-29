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
  Mic,
  Bold,
  Italic,
  RotateCw,
  Type,
  PaintBucket,
  Baseline,
  CircleX,
  Save,
  Eye,
  EyeOff,
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
  console.log("cardIdcardId", cardId);
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
  const [isListening, setIsListening] = useState("");
  const [toggleHeader, setToggleHeader] = useState(true);

  const [showBackgroundTextPicker, setShowBackgroundTextPicker] =
    useState(false);

  const containerRef = useRef(null);

  const API_BASE_URL = "http://localhost:5500/api";
  const loggedInEmployeeId = localStorage.getItem("employeeId");
  console.log("loggedInEmployeeId", loggedInEmployeeId);
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
        .catch((err) => toast.error("Failed to update position.", err));
    }
  };

  const handleSaveModal = () => {
    if (!modalData) return;
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
      cardId,
    } = modalData;
    console.log("modalData", modalData);
    console.log("cardId", cardId);
    console.log("cardIdcardId3", cardId);
    console.log(x, y);
    if (greetingId) {
      // Edit existing greeting
      axios
        .put(`${API_BASE_URL}/greetings/${greetingId}`, {
          cardId: cardId,
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
                    cardId,
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

          setIsModalOpen(false);
          setShowTextPicker(false);
          setShowFont(false);
          setShowBackgroundTextPicker(false);
          setModalData({
            text: "",
            name: "",
            backgroundColor: "transparent",
            textColor: "black",
            rotation: 0,
            fontFamily: "inherit",
            isBold: false,
            isItalic: false,
            cardId,
          });
          toast.success("Greeting updated successfully.");
        })
        .catch((err) => {
          console.log("Errored ", err.response.data.error);
          toast.error(
            `Failed to update greeting. ${
              err.response?.data?.error || "An unexpected error occurred."
            }`
          );
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
      console.log("newGreeting", newGreeting);

      axios
        .post(`${API_BASE_URL}/greetings`, newGreeting)
        .then((response) => {
          setTextItems((prev) => [...prev, response.data]);
          toast.success("Greeting added successfully.");
          setIsModalOpen(false);
          setShowTextPicker(false);
          setShowFont(false);
          setShowBackgroundTextPicker(false);
          setModalData({
            text: "",
            name: "",
            backgroundColor: "transparent",
            textColor: "black",
            rotation: 0,
            fontFamily: "inherit",
            isBold: false,
            isItalic: false,
            cardId: cardId,
          });
        })
        .catch((err) => toast.error("Failed to add greeting.", err));
    }
  };

  const DraggableTextItem = ({ item }) => {
    const [, drag] = useDrag({
      type: ItemType.TEXT,
      item: { id: item.greetingId },
    });
    console.log(
      "Checkking",
      typeof loggedInEmployeeId,
      typeof item.employeeId,
      loggedInEmployeeId === item.employeeId
    );
    return (
      <div
        ref={drag}
        className="absolute cursor-grab group"
        style={{
          left: `${item.x}px`,
          top: `${item.y}px`,
          color:
            modalData?.greetingId === item?.greetingId
              ? modalData?.textColor || greetTextColour
              : item.textColor || greetTextColour,
          backgroundColor:
            modalData?.greetingId === item?.greetingId
              ? modalData?.backgroundColor || greetBackgroundColour
              : item.backgroundColor || greetBackgroundColour,
          padding: "5px 10px",
          borderRadius: "5px",
          zIndex: 10,
          fontWeight:
            modalData?.greetingId === item?.greetingId
              ? modalData?.isBold
                ? "bold"
                : "normal"
              : item.isBold
              ? "bold"
              : "normal",
          fontStyle:
            modalData?.greetingId === item?.greetingId
              ? modalData?.isItalic
                ? "italic"
                : "normal"
              : item.isItalic
              ? "italic"
              : "normal",
          fontFamily:
            modalData?.greetingId === item?.greetingId
              ? modalData?.fontFamily || "inherit"
              : item.fontFamily || "inherit",
          transform: `rotate(${
            modalData?.greetingId === item?.greetingId
              ? modalData?.rotation || 0
              : item.rotation || 0
          }deg)`,
        }}
      >
        <div className="flex flex-col">
          {/* <span>{item.message}</span> */}
          <span>
            {modalData?.greetingId === item?.greetingId
              ? modalData?.text ?? ""
              : item?.message ?? ""}
          </span>

          <span className="text-sm mt-1">
            -{" "}
            {modalData?.greetingId === item?.greetingId
              ? modalData?.name ?? ""
              : item?.senderName ?? ""}
          </span>
        </div>
        {loggedInEmployeeId == item.employeeId && (
          <button
            onClick={(e) => {
              console.log(loggedInEmployeeId);
              console.log(item.employeeId);
              console.log("Edit button clicked!");
              e.stopPropagation();

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
                cardId,
              });
              setIsModalOpen(true);
              setToggleHeader(false);
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

    recognition.onstart = () => setIsListening(field);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setModalData((prev) => ({
        ...prev,
        [field]: transcript,
      }));
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      toast.error(event.error);
    };

    recognition.onend = () => setIsListening("");

    recognition.start();
  };

  // const handleDownload = async () => {
  //   if (!containerRef.current) {
  //     toast.error("Unable to download the card.");
  //     return;
  //   }

  //   setDownloading(true);

  //   // Save original dimensions
  //   const originalWidth = containerRef.current.style.width;
  //   const originalHeight = containerRef.current.style.height;

  //   // // Increase dimensions by 100px
  //   // containerRef.current.style.width = `${
  //   //   containerRef.current.offsetWidth + 100
  //   // }px`;
  //   // containerRef.current.style.height = `${
  //   //   containerRef.current.offsetHeight + 100
  //   // }px`;

  //   try {
  //     // Capture the updated size
  //     const image = await toPng(containerRef.current);

  //     // Reset to original dimensions
  //     containerRef.current.style.width = originalWidth;
  //     containerRef.current.style.height = originalHeight;

  //     download(image, `${title || "greeting-card"}.png`);
  //     toast.success("Card downloaded successfully!");
  //   } catch (error) {
  //     toast.error("Failed to download the card.", error);
  //   } finally {
  //     // Ensure dimensions are reset in case of error
  //     containerRef.current.style.width = originalWidth;
  //     containerRef.current.style.height = originalHeight;
  //     setDownloading(false);
  //   }
  // };

  const handleDownload = async () => {
    if (!containerRef.current) {
      toast.error("Unable to process the card.");
      return;
    }

    setDownloading(true);

    // Save original dimensions
    const originalWidth = containerRef.current.style.width;
    const originalHeight = containerRef.current.style.height;

    try {
      // Capture the card as an image (Base64 format)
      const imageBase64 = await toPng(containerRef.current);

      // Prepare email payload
      const payload = {
        recipientEmail: "raghav.mohan@motherson.com",
        subject: title || "Your Greeting Card",
        message: "Here's your personalized greeting card!",
        imageBase64: imageBase64.split(",")[1],
        fileName: `${title || "greeting-card"}`,
        cardId: cardId,
      };
      console.log("PL", payload);
      // Send email via API
      const response = await fetch(`${API_BASE_URL}/cards/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Card sent via email successfully!");
      } else {
        const errorData = await response.json();
        toast.error(`Failed to send email: ${errorData.message}`);
      }
    } catch (error) {
      toast.error("An error occurred while sending the email.", error);
    } finally {
      containerRef.current.style.width = originalWidth;
      containerRef.current.style.height = originalHeight;
      setDownloading(false);
    }
  };

  const handleToggleHeader = () => {
    setToggleHeader((prevState) => !prevState);
  };

  return (
    <>
      {loading ? (
        <GreetingCardSkeleton />
      ) : (
        <DndProvider backend={HTML5Backend}>
          {/* header */}

          <div
            className={`fixed top-0 left-0 right-0 flex justify-around items-center w-full bg-white z-[999] shadow-md transition-transform duration-300 ${
              toggleHeader ? "-translate-y-full" : "translate-y-0"
            }`}
          >
            {/* Left: Preview Box */}
            {/* <div className="bg-gray-300 rounded-md shadow-sm flex  p-1 w-1/5">
              <div
                className="text-center p-1 rounded-md w-full transition-transform duration-300 flex flex-col items-center justify-center"
                style={{
                  backgroundColor: modalData?.backgroundColor || "transparent",
                  color: modalData?.textColor || "black",
                  transform: `rotate(${modalData?.rotation || 0}deg)`,
                  fontFamily: modalData?.fontFamily || "inherit",
                  fontWeight: modalData?.isBold ? "bold" : "normal",
                  fontStyle: modalData?.isItalic ? "italic" : "normal",
                }}
              >
                <p className="text-xs text-center">
                  {modalData?.text || "Your message here..."}
                </p>
              </div>
            </div> */}

            {/* Right: Input Form */}
            <div className="w-full flex items-center justify-around gap-3 p-1 ">
              <div className="relative flex items-center w-2/5 m-1">
                <input
                  type="text"
                  className="p-2 pl-3 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  placeholder="Message"
                  value={modalData?.text}
                  onChange={(e) =>
                    setModalData({ ...modalData, text: e.target.value })
                  }
                />
                <button
                  onClick={() => {
                    startListening("text");
                  }}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-2 transition ${
                    isListening == "text"
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  <Mic
                    size={16}
                    color="#243dff"
                    strokeWidth={0.5}
                    absoluteStrokeWidth
                  />
                </button>
              </div>

              <div className="relative flex items-center w-1/6">
                <input
                  type="text"
                  className="p-2 pl-3 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  placeholder="Sender"
                  value={modalData?.name}
                  onChange={(e) =>
                    setModalData({ ...modalData, name: e.target.value })
                  }
                />
                <button
                  onClick={() => {
                    startListening("name");
                  }}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-2 transition ${
                    isListening == "name"
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  <Mic
                    size={16}
                    color="#243dff"
                    strokeWidth={0.5}
                    absoluteStrokeWidth
                  />
                </button>
              </div>

              {/* Formatting Controls */}
              <div
                className="flex flex-col items-center gap-1 p-1 cursor-pointer "
                onClick={() =>
                  setModalData({
                    ...modalData,
                    isBold: !modalData?.isBold,
                    cardId: cardId,
                  })
                }
              >
                <button className={`rounded-lg transition `}>
                  <Bold size={16} strokeWidth={0.5} absoluteStrokeWidth />
                </button>
                <span className="text-xs">Bold</span>
              </div>
              <div
                className="flex flex-col items-center gap-1 cursor-pointer "
                onClick={() =>
                  setModalData({
                    ...modalData,
                    isItalic: !modalData?.isItalic,
                    cardId: cardId,
                  })
                }
              >
                <button className={` rounded-md transition `}>
                  <Italic size={14} strokeWidth={0.5} absoluteStrokeWidth />
                </button>
                <span className="text-xs">Italic</span>
              </div>

              <div
                className="flex flex-col items-center gap-1 cursor-pointer "
                onClick={() =>
                  setModalData({
                    ...modalData,
                    rotation: (modalData?.rotation || 0) - 10,
                    cardId: cardId,
                  })
                }
              >
                <button className=" rounded-lg transition">
                  <RotateCcw size={16} strokeWidth={0.5} absoluteStrokeWidth />
                </button>
                <span className="text-xs">Left</span>
              </div>
              <div
                className="flex flex-col items-center gap-1 cursor-pointer "
                onClick={() =>
                  setModalData({
                    ...modalData,
                    rotation: (modalData?.rotation || 0) + 10,
                    cardId: cardId,
                  })
                }
              >
                <button className="rounded-lg transition">
                  <RotateCw size={16} strokeWidth={0.5} absoluteStrokeWidth />
                </button>
                <span className="text-xs">Right</span>
              </div>
              {/* Font Picker */}
              <div
                className="flex flex-col items-center gap-1 cursor-pointer "
                onClick={() => {
                  setShowFont(!showFont);
                  setShowTextPicker(false);
                  setShowBackgroundTextPicker(false);
                }}
              >
                <div className="rounded-lg cursor-pointer">
                  <Type size={16} strokeWidth={0.5} absoluteStrokeWidth />
                </div>
                <span className="text-xs">Font</span>
              </div>
              {/* Color Pickers */}
              <div
                className="flex flex-col items-center gap-1 cursor-pointer "
                onClick={() => {
                  setShowTextPicker(!showTextPicker);
                  setShowFont(false);
                  setShowBackgroundTextPicker(false);
                }}
              >
                <div className=" cursor-pointer rounded-lg transition ">
                  <Baseline size={16} strokeWidth={0.5} absoluteStrokeWidth />
                </div>
                <span className="text-xs">Text </span>
              </div>
              <div
                className="flex flex-col items-center gap-1 cursor-pointer "
                onClick={() => {
                  setShowBackgroundTextPicker(!showBackgroundTextPicker);
                  setShowFont(false);
                  setShowTextPicker(false);
                }}
              >
                <div className=" rounded-lg transition">
                  <PaintBucket
                    size={16}
                    strokeWidth={0.5}
                    absoluteStrokeWidth
                  />
                </div>
                <span className="text-xs">BG </span>
              </div>
              {/* Action Buttons */}
              <div
                className="flex flex-col items-center gap-1 cursor-pointer "
                onClick={() => {
                  setIsModalOpen(false);
                  setModalData({
                    text: "",
                    name: "",
                    backgroundColor: "transparent",
                    textColor: "black",
                    rotation: 0,
                    fontFamily: "inherit",
                    isBold: false,
                    isItalic: false,
                    cardId: cardId,
                  });
                }}
              >
                <button className="bg-red-500 p-1 text-white  rounded-lg text-sm hover:bg-red-600 transition">
                  <CircleX size={20} strokeWidth={0.5} absoluteStrokeWidth />
                </button>
                <span className="text-xs">Cancel </span>
              </div>

              <div
                className="flex flex-col items-center gap-1 cursor-pointer "
                onClick={handleSaveModal}
              >
                <button className="bg-green-500 p-1 text-white rounded-lg text-sm hover:bg-green-600 transition">
                  <Save size={20} strokeWidth={0.5} absoluteStrokeWidth />
                </button>
                <span className="text-xs">Save </span>
              </div>

              <div
                className="flex flex-col items-center gap-1 cursor-pointer "
                onClick={handleDownload}
              >
                <button className="bg-yellow-500 p-1 text-white rounded-lg text-sm hover:bg-yellow-600 transition">
                  <Download size={20} strokeWidth={0.5} absoluteStrokeWidth />
                </button>
                <span className="text-xs">Download </span>
              </div>
              <div
                className="flex flex-col items-center gap-1 cursor-pointer "
                onClick={() => {
                  setShowBackgroundTextPicker(false);
                  setShowFont(false);
                  setShowTextPicker(false);
                  handleToggleHeader();
                }}
              >
                <button className="bg-black p-1 text-white rounded-lg text-sm hover:bg-gray-600 transition">
                  <EyeOff
                    size={20}
                    color="#ffffff"
                    strokeWidth={0.5}
                    absoluteStrokeWidth
                  />
                </button>
                <span className="text-xs">Hide </span>
              </div>
            </div>
          </div>

          {/* downloading */}
          {downloading && (
            <div className="fixed inset-[-5vh] bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="text-white text-xl">Mailing...</div>
            </div>
          )}

          {/* Font Dropdown */}
          {showFont && (
            <div
              className="fixed right-4 z-50 bg-gray-200 shadow-lg p-3 rounded-lg border w-fit"
              style={{
                top: "4rem",
              }}
            >
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
                        cardId: cardId,
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
            <div
              // className="fixed left-1/2 transform -translate-x-1/2 z-50 bg-gray-200 shadow-lg p-3 rounded-lg border w-fit"
              className="fixed right-4 z-50 bg-gray-200 shadow-lg p-3 rounded-lg border w-fit"
              style={{
                top: "4rem",
              }}
            >
              <div className="flex justify-between items-center mb-2 ">
                <label className="text-xs font-medium">Text Color</label>
                <button onClick={() => setShowTextPicker(false)}>❌</button>
              </div>
              <SketchPicker
                color={modalData?.textColor}
                onChange={(color) =>
                  setModalData({
                    ...modalData,
                    textColor: color.hex,
                    cardId: cardId,
                  })
                }
              />
            </div>
          )}

          {/* Background Color Picker */}
          {showBackgroundTextPicker && (
            <div
              className="fixed right-4 z-50 bg-gray-200 shadow-lg p-3 rounded-lg border w-fit"
              style={{
                top: "4rem",
              }}
            >
              <div className="flex justify-between items-center mb-2 ">
                <label className="text-xs font-medium">Background Color</label>
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
                    cardId: cardId,
                  })
                }
                presetColors={[
                  "transparent",
                  "#FF6900",
                  "#FCB900",
                  "#7BDCB5",
                  "#00D084",
                  "#8ED1FC",
                  "#0693E3",
                  "#ABB8C3",
                  "#EB144C",
                  "#F78DA7",
                  "#9900EF",
                ]}
              />
            </div>
          )}

          {/* Greeting Card */}
          <div
            className={`flex flex-col items-center space-y-6 bg-gradient-to-br from-indigo-500 to-purple-600  
            ${toggleHeader ? "" : "mt-14"}`}
          >
            <div className="fixed w-full flex justify-end pr-4 m-1">
              <div
                className={`flex flex-col items-center gap-1 cursor-pointer  ${
                  toggleHeader ? "translate-y-0" : "-translate-y-full"
                }`}
                onClick={handleToggleHeader}
              >
                <button className="bg-black p-1 text-white rounded-lg text-sm hover:bg-gray-600 transition">
                  <Eye
                    size={20}
                    color="#ffffff"
                    strokeWidth={0.5}
                    absoluteStrokeWidth
                  />
                </button>
                <span className="text-xs">Show </span>
              </div>
            </div>
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
                backgroundSize: "contain",
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
                  cardId: cardId,
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
