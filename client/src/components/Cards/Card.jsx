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

const ItemType = {
  TEXT: "text",
};

const GreetingCard = () => {
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
          setModalData(null);
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

  return (
    <>
      {loading ? (
        <GreetingCardSkeleton />
      ) : (
        <DndProvider backend={HTML5Backend}>
          <div className="flex flex-col items-center space-y-6 bg-gradient-to-br from-indigo-500 to-purple-600">
            <div className="flex justify-between items-center w-full p-4">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg"
              >
                Home
              </button>
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              <Menu
                as="div"
                className="relative inline-block text-left z-[999]"
              >
                <div>
                  <Menu.Button className="inline-flex justify-center w-full px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 shadow transition">
                    Actions
                    <ChevronDown className="w-5 h-5 ml-2" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleResize}
                            className={`${
                              active
                                ? "bg-yellow-500 text-white"
                                : "text-gray-700"
                            } group flex items-center w-full px-4 py-2 text-sm space-x-2`}
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Reset Size</span>
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleSizeIncrease}
                            className={`${
                              active
                                ? "bg-green-600 text-white"
                                : "text-gray-700"
                            } group flex items-center w-full px-4 py-2 text-sm space-x-2`}
                          >
                            <Plus className="w-4 h-4" />
                            <span>Increase Size</span>
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleSizeDecrease}
                            className={`${
                              active ? "bg-red-600 text-white" : "text-gray-700"
                            } group flex items-center w-full px-4 py-2 text-sm space-x-2`}
                          >
                            <Minus className="w-4 h-4" />
                            <span>Decrease Size</span>
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleDownload}
                            className={`${
                              active ? "bg-black text-white" : "text-gray-700"
                            } group flex items-center w-full px-4 py-2 text-sm space-x-2`}
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>

            {downloading && (
              <div className="fixed inset-[-5vh] bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="text-white text-xl">Downloading...</div>
              </div>
            )}

            <div
              ref={(node) => {
                containerRef.current = node;
                drop(node);
              }}
              className="relative bg-white rounded-lg shadow-lg"
              style={{
                height: `${cardHeight}px`,
                width: `${cardWidth}px`,
                background: `url(${cardBackground}) center/cover no-repeat`,
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

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
              <div className="bg-gray-100 rounded-xl shadow-xl p-8 w-full max-w-5xl">
                <h3 className="text-2xl font-bold mb-6 text-center ">
                  {modalData.greetingId ? "Edit Greeting" : "Add Greeting"}
                </h3>
                <div className=" flex gap-6">
                  {/* Form Fields */}
                  <div className="w-1/2 flex flex-col space-y-6">
                    {/* Bottom Left: Color Pickers */}
                    <div className="flex space-x-6">
                      {/* Color picker */}
                      <div className="flex flex-col w-1/2">
                        {showTextPicker && (
                          <div className="absolute z-50 mt-2 bg-gray-200 shadow-lg p-2 rounded-md">
                            <label className="text-sm text-gray-700 font-medium mb-2">
                              Text Color
                            </label>
                            <button
                              className="text-sm text-gray-700 font-medium mb-2"
                              onClick={() => setShowTextPicker(!showTextPicker)}
                            >
                              ❌
                            </button>
                            <SketchPicker
                              color={modalData.textColor}
                              onChange={(color) =>
                                setModalData((prev) => ({
                                  ...prev,
                                  textColor: color.hex,
                                }))
                              }
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col w-1/2">
                        {showBackgroundTextPicker && (
                          <div className="absolute z-50 mt-2  bg-gray-200 shadow-lg p-2 rounded-md">
                            <label className="text-sm text-gray-700 font-medium mb-2">
                              BG Color
                            </label>
                            <button
                              className="text-sm text-gray-700 font-medium mb-2"
                              onClick={() =>
                                setShowBackgroundTextPicker(
                                  !showBackgroundTextPicker
                                )
                              }
                            >
                              ❌
                            </button>
                            <SketchPicker
                              color={modalData.backgroundColor}
                              onChange={(color) =>
                                setModalData((prev) => ({
                                  ...prev,
                                  backgroundColor: color.hex,
                                }))
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/*Preview (*/}
                    <div className="   bottom-4 right-4 p-6 rounded-lg shadow-lg  bg-gray-300 z-40">
                      <div
                        className="w-full text-center"
                        style={{
                          backgroundColor: modalData.backgroundColor,
                          color: modalData.textColor,
                          transform: `rotate(${modalData.rotation}deg)`,
                          fontFamily: modalData.fontFamily || "inherit",
                          fontWeight: modalData.isBold ? "bold" : "normal",
                          fontStyle: modalData.isItalic ? "italic" : "normal",
                        }}
                      >
                        <p className="text-lg ">
                          {modalData.text || "Your message here..."}
                        </p>
                        <p className="text-sm mt-2">{`- ${
                          modalData.name || "Sender"
                        }`}</p>
                      </div>
                    </div>
                  </div>

                  {/*  Form Fields */}
                  <div className="w-1/2 flex flex-col space-y-6">
                    {/* Top: Message Input */}
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-700 font-medium mb-2">
                        Message
                      </label>
                      <input
                        type="text"
                        placeholder="Enter message"
                        value={modalData.text}
                        maxLength={60}
                        onChange={(e) =>
                          setModalData((prev) => ({
                            ...prev,
                            text: e.target.value,
                          }))
                        }
                        className="p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    {/* Top: Sender Name Input */}
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-700 font-medium mb-2">
                        Sender
                      </label>
                      <input
                        type="text"
                        placeholder="Enter sender name"
                        value={modalData.name}
                        onChange={(e) =>
                          setModalData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    {/* Font Selector */}
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-700 font-medium mb-2">
                        Font
                      </label>
                      <select
                        value={modalData.fontFamily}
                        onChange={(e) =>
                          setModalData((prev) => ({
                            ...prev,
                            fontFamily: e.target.value,
                          }))
                        }
                        className="p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        {fontFamilies.map((font, index) => (
                          <option key={index} value={font.value}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-4 mt-4">
                      {/* Bold & Italic */}
                      <button
                        onClick={() =>
                          setModalData((p) => ({ ...p, isBold: !p.isBold }))
                        }
                        className={`px-3 py-2 rounded-md transition ${
                          modalData.isBold
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        onClick={() =>
                          setModalData((p) => ({ ...p, isItalic: !p.isItalic }))
                        }
                        className={`px-3 py-2 rounded-md transition ${
                          modalData.isItalic
                            ? "bg-blue-500 text-white italic"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        <em>I</em>
                      </button>

                      {/* Rotation */}
                      <button
                        onClick={() =>
                          setModalData((p) => ({
                            ...p,
                            rotation: (p.rotation || 0) - 10,
                          }))
                        }
                        className="px-3 py-2 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                      >
                        ↺
                      </button>
                      <label className="text-sm text-gray-700 font-medium">
                        Rotate
                      </label>
                      <button
                        onClick={() =>
                          setModalData((p) => ({
                            ...p,
                            rotation: (p.rotation || 0) + 10,
                          }))
                        }
                        className="px-3 py-2 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                      >
                        ↻
                      </button>

                      {/* Text & Background Color */}
                      <div
                        className="relative w-10 h-10 rounded-md border cursor-pointer flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: modalData.textColor }}
                        onClick={() => setShowTextPicker(!showTextPicker)}
                      >
                        <span className="text-black font-medium text-xs">
                          T
                        </span>
                      </div>
                      <div
                        className="relative w-10 h-10 rounded-md border cursor-pointer flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: modalData.backgroundColor }}
                        onClick={() =>
                          setShowBackgroundTextPicker(!showBackgroundTextPicker)
                        }
                      >
                        <span className="text-black font-medium text-xs">
                          BG
                        </span>
                      </div>

                      {/* font */}
                      <div
                        className="relative w-10 h-10 rounded-md border cursor-pointer flex items-center justify-center shadow-sm"
                        style={{ fontFamily: modalData.fontFamily }}
                        onClick={() => setShowTextPicker(!showTextPicker)}
                      >
                        <span className="text-black font-medium text-xs">
                          F
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end mt-8 space-x-4">
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-500 transition duration-200 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveModal}
                        className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-200 text-sm"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DndProvider>
      )}
    </>
  );
};

export default GreetingCard;
