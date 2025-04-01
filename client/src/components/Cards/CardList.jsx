import React, { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import CardListSkeleton from "./CardListSkeleton";
import {
  Edit2,
  Plus,
  ChevronDown,
  RefreshCw,
  Minus,
  Download,
} from "lucide-react";
import { Menu, Transition } from "@headlessui/react";
import { colors, eventList } from "../../constants.json";

const CardItem = ({ card, onEdit, onDelete, navigate }) => (
  <div
    key={card.cardId}
    className="bg-white shadow-md rounded-xl overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
    onClick={() => navigate(`/cards/${card.cardId}`)}
  >
    <img
      src={card.cardBackgroundUrl}
      alt={card.cardTitle}
      className="w-full h-48 object-cover"
    />
    <div className="p-6 flex justify-between items-center">
      <div>
        <h3 className="font-bold text-xl text-gray-800 mb-2">
          {card.cardTitle}
        </h3>

        {/* <button class="group relative px-2 py-1 rounded-xl bg-zinc-900 text-amber-300 font-bold tracking-widest uppercase text-sm border-b-4 border-amber-400/50 hover:border-amber-400 transition-all duration-300 ease-in-out hover:text-amber-200 shadow-[0_10px_20px_rgba(251,191,36,0.15)] hover:shadow-[0_15px_30px_rgba(251,191,36,0.25)] active:border-b-0 active:translate-y-1">
          <span class="flex items-center gap-3 relative z-10">
            <svg fill="currentColor" viewBox="0 0 24 24" class="w-2 h-2">
              <path d="M12 2L9.1 9.1H2L7.5 13.8L5.7 21L12 17.3L18.3 21L16.5 13.8L22 9.1H14.9L12 2Z"></path>
            </svg>
            {card.cardTitle}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-5 h-5 transition-all duration-300 group-hover:translate-x-1"
            ></svg>
          </span>
          <div class="absolute -inset-1 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 blur-2xl group-hover:blur-xl transition-all duration-300 -z-10 opacity-0 group-hover:opacity-100"></div>
        </button> */}
        <p className="text-gray-600">
          <strong>{card.eventType}</strong>
        </p>
        <p className="text-gray-600">
          <strong>Employee ID:</strong> {card.ReciverEmployeeId}
        </p>
      </div>

      <div className="flex space-x-3 ">
        <FaEdit
          className="text-blue-500 hover:text-blue-700 cursor-pointer "
          onClick={(e) => {
            e.stopPropagation();
            onEdit(card);
          }}
        />
        <FaTrash
          className="text-red-500 hover:text-red-700 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.cardId);
          }}
        />
      </div>
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, onSave, title, fields }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
        <h3 className="text-2xl font-bold mb-6">{title}</h3>
        <div className="grid grid-cols-2 gap-6">
          {fields.map((field, index) => (
            <div key={index} className="flex items-center">
              <label className="block w-1/3 text-gray-700 font-medium pr-4">
                {field.label}
              </label>
              {field.type === "dropdown" ? (
                <select
                  value={field.value}
                  onChange={(e) => field.setValue(e.target.value)}
                  className="w-2/3 p-3 border border-gray-300 rounded-lg"
                >
                  {field.options.map((option, idx) => (
                    <option key={idx} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => field.setValue(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-2/3 p-3 border border-gray-300 rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg mr-2"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition duration-300"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const CardsList = () => {
  const [cards, setCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardBackgroundUrl, setNewCardBackgroundUrl] = useState("");
  const [receiverEmployeeId, setReceiverEmployeeId] = useState("");
  const [greetBackgroundColour, setGreetBackgroundColour] = useState("");
  const [greetTextColour, setGreetTextColour] = useState("");
  const [eventType, setEventType] = useState("");
  const [editCardId, setEditCardId] = useState(null);
  const [selectedEventLabel, setSelectedEventLabel] = useState("All");
  const navigate = useNavigate();

  const fetchCards = async (query = "") => {
    const baseUrl = "http://localhost:5500/api/cards";
    const url = query ? `${baseUrl}/search` : baseUrl;

    console.log("Request URL:", url);
    console.log("Query parameter sent:", query.trim());

    setLoading(true);
    try {
      const response = await axios.get(url, {
        params: query.trim() ? { query: query.trim() } : {},
      });
      console.log("API Response:", response.data);
      setCards(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching cards :", error);
      setError("Failed to load cards. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch filtered cards based on eventType
  const handleFilter = async (eventType) => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5500/api/cards/filter",
        {
          params: { eventType, searchQuery },
        }
      );
      setCards(response.data.data);
      console.log("Filtered cards:", response.data.data);
    } catch (error) {
      console.error("Error filtering cards:", error);
      toast.error("Failed to filter cards. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelection = (event) => {
    setSelectedEventLabel(event.label); // Update button text
    handleFilter(event.value); // Call the filter function
  };

  useEffect(() => {
    // Initial fetch to load all cards
    fetchCards();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      // Reset to all cards if search query is empty
      fetchCards();
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchCards(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleOpenModal = (card = null) => {
    if (card) {
      console.log("card", card);
      setEditCardId(card.cardId);
      setNewCardTitle(card.cardTitle);
      setEventType(card.eventType);
      setNewCardBackgroundUrl(card.cardBackgroundUrl);
      setReceiverEmployeeId(card.ReciverEmployeeId);
      setGreetBackgroundColour(card.greetBackgroundColour);
      setGreetTextColour(card.greetTextColour);
    } else {
      setEditCardId(null);
      setNewCardTitle("");
      setEventType("");
      setNewCardBackgroundUrl("");
      setReceiverEmployeeId("");
      setGreetBackgroundColour("");
      setGreetTextColour("");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateOrUpdateCard = async () => {
    const payload = {
      cardTitle: newCardTitle,
      cardBackgroundUrl: newCardBackgroundUrl,
      ReciverEmployeeId: receiverEmployeeId,
      greetBackgroundColour: greetBackgroundColour,
      greetTextColour: greetTextColour,
      eventType: eventType,
    };
    console.log(payload);
    try {
      if (editCardId) {
        const response = await axios.put(
          `http://localhost:5500/api/cards/${editCardId}`,
          payload
        );
        setCards(
          cards.map((card) =>
            card.cardId === editCardId ? response.data.data : card
          )
        );
        toast.success("Card updated successfully!");
      } else {
        const response = await axios.post(
          "http://localhost:5500/api/cards",
          payload
        );
        setCards([...cards, response.data.data]);
        toast.success("Card created successfully!");
      }
    } catch (error) {
      console.error("Error saving card:", error);
      toast.error("Failed to save card. Please try again later.");
    } finally {
      handleCloseModal();
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await axios.delete(`http://localhost:5500/api/cards/${cardId}`);
      setCards(cards.filter((card) => card.cardId !== cardId));
      toast.success("Card deleted successfully!");
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error("Failed to delete card. Please try again later.");
    }
  };

  //   if (loading) {
  //     return (
  //       <div className="flex items-center justify-center min-h-screen">
  //         {/* Loading... */}
  //         <LoadingSkeleton />
  //       </div>
  //     );
  //   }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-300 to-purple-500 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r  from-[#443627] to-[#690B22]">
            Browse Your Cards
          </h2>

          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedEventLabel("All");
              }}
              placeholder="Search by title or ID"
              className="p-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={() => handleOpenModal()}
              className="bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-green-600 transition duration-300"
            >
              Create Card
            </button>
          </div>
        </div>

        {/* filter */}
        <div className="flex flex-row-reverse  m-3">
          <Menu as="div" className="relative inline-block text-left z-[999]">
            <div>
              <Menu.Button className="inline-flex justify-center w-full px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 shadow transition">
                {selectedEventLabel}
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
                  {eventList.map((event, index) => (
                    <Menu.Item key={index}>
                      {({ active }) => (
                        <button
                          onClick={() => handleEventSelection(event)}
                          className={`${
                            active
                              ? "bg-yellow-500 text-white"
                              : "text-gray-700"
                          } group flex items-center w-full px-4 py-2 text-sm space-x-2`}
                        >
                          <span>{event.label}</span>
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        {loading ? (
          <div>
            <CardListSkeleton />
          </div>
        ) : cards?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card) => (
              <CardItem
                key={card.cardId}
                card={card}
                onEdit={handleOpenModal}
                onDelete={handleDeleteCard}
                navigate={navigate}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-600 text-center">
            No cards found. Try creating a new card!
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleCreateOrUpdateCard}
        title={editCardId ? "Edit Card" : "Create New Card"}
        fields={[
          {
            label: "Card Title",
            value: newCardTitle,
            setValue: setNewCardTitle,
            placeholder: "Enter Card Title",
          },
          {
            label: "Event Type",
            value: eventType,
            setValue: setEventType,
            type: "dropdown",
            options: eventList,
          },
          {
            label: "Background URL",
            value: newCardBackgroundUrl,
            setValue: setNewCardBackgroundUrl,
            placeholder: "Enter Background URL",
          },
          {
            label: "Receiver's Employee ID",
            value: receiverEmployeeId,
            setValue: setReceiverEmployeeId,
            placeholder: "Enter Receiver's Employee ID",
          },
          {
            label: "Greet Background Colour",
            value: greetBackgroundColour,
            setValue: setGreetBackgroundColour,
            type: "dropdown",
            options: colors,
          },
          {
            label: "Greet Text Colour",
            value: greetTextColour,
            setValue: setGreetTextColour,
            type: "dropdown",
            options: colors,
          },
        ]}
      />
    </div>
  );
};

export default CardsList;
