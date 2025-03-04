"use client";
import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";

export default function ImageUploader() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);

    // Convert image to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const response = await fetch("/api/remove-bg", {
          method: "POST",
          body: JSON.stringify({ image: reader.result }),
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        setImage(data.processedImage); // Store the new image URL
      } catch (error) {
        console.error("Error removing background:", error);
      }
      setLoading(false);
    };
  };

  const handleDelete = () => {
    setImage(null);
  };

  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg">
      {/* Upload Button */}
      <label className="cursor-pointer flex items-center justify-center w-16 h-16 border rounded-lg bg-gray-100">
        <span className="text-2xl">+</span>
        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </label>

      {/* Image Preview */}
      {loading ? (
        <p>Processing...</p>
      ) : (
        image && (
          <div className="relative">
            <img src={image} alt="Processed" className="w-16 h-16 object-cover rounded-lg" />
            <button
              onClick={handleDelete}
              className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
            >
              <FaTrashAlt />
            </button>
          </div>
        )
      )}
    </div>
  );
}
