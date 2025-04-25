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

const Preview = () => {
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
  const [toggleHeader, setToggleHeader] = useState(true);

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

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        {/* Greeting Card */}
        <div
          className={`flex flex-col items-center bg-gradient-to-br from-indigo-500 to-purple-600  
           `}
        >
          <div
            ref={(node) => {
              containerRef.current = node;
              drop(node);
            }}
            className="relative bg-white rounded-lg shadow-lg"
            style={{
              height: `${cardHeight}px`,
              width: `${cardWidth}px`,
              backgroundImage: `url(${image})`,
              backgroundPosition: "center",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
            }}
          >
            {textItems.map((item) => (
              <DraggableTextItem key={item.greetingId} item={item} />
            ))}
          </div>
        </div>
      </DndProvider>
    </>
  );
};

export default Preview;
