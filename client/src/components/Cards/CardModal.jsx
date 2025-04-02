import { useState } from "react";
import { fontFamilies } from "../../constants.json";

const CardModal = ({ IncommingModalData, onSave, onClose }) => {
  const [modalData, setModalData] = useState(IncommingModalData);

  const handleSaveModal = () => {
    onSave(modalData); // Send data back to parent
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-5xl">
        <h3 className="text-2xl font-bold mb-6 text-center ">
          {modalData.greetingId ? "Edit Greeting" : "Add Greeting"}
        </h3>
        <div className="flex gap-6">
          {/* Form Fields */}
          <div className="w-1/2 flex flex-col space-y-6">
            {/* Message Input */}
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
                  setModalData((prev) => ({ ...prev, text: e.target.value }))
                }
                className="p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Sender Name Input */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 font-medium mb-2">
                Sender
              </label>
              <input
                type="text"
                placeholder="Enter sender name"
                value={modalData.name}
                onChange={(e) =>
                  setModalData((prev) => ({ ...prev, name: e.target.value }))
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
          </div>

          {/* Preview Section */}
          <div className="w-1/4 bg-gray-100 p-4 rounded-lg shadow-md">
            <div
              className="w-full text-center p-4 rounded-md"
              style={{
                backgroundColor: modalData.backgroundColor,
                color: modalData.textColor,
                transform: `rotate(${modalData.rotation}deg)`,
                fontFamily: modalData.fontFamily || "inherit",
                fontWeight: modalData.isBold ? "bold" : "normal",
                fontStyle: modalData.isItalic ? "italic" : "normal",
              }}
            >
              <p className="text-lg">
                {modalData.text || "Your message here..."}
              </p>
              <p className="text-sm mt-2">{`- ${
                modalData.name || "Sender"
              }`}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mt-8 space-x-4">
          <button
            onClick={onClose}
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
  );
};

export default CardModal;
