"use client";
import { useState, useEffect } from "react";
import { FaDownload } from "react-icons/fa";

export default function DownloadButton({ image }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (image) {
      convertToBlob(image);
    }
  }, [image]);

  const convertToBlob = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl, { mode: "cors" }); // CORS issue fix
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
    } catch (error) {
      console.error("Blob conversion failed:", error);
    }
  };

  const handleDownload = async (quality) => {
    if (!blobUrl) {
      console.error("Blob URL not available.");
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.crossOrigin = "anonymous"; // CORS issue fix
    img.src = blobUrl;

    img.onload = () => {
      // Adjust image size based on quality
      if (quality === "preview") {
        canvas.width = 432;
        canvas.height = 578;
      } else {
        canvas.width = 748;
        canvas.height = 1000;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = quality === "high" ? "high-quality.png" : "preview.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, "image/png");
    };
  };

  return (
    <div className="relative inline-block">
      {/* Main Download Button */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 text-lg font-semibold"
      >
        <FaDownload className="mr-2" /> Download
      </button>

      {/* Download Options Dropdown */}
      {showOptions && (
        <div className="absolute left-0 mt-2 bg-white shadow-lg rounded-lg p-4 w-56">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Preview</span>
            <span className="text-sm text-gray-500">432 x 578</span>
            <button
              onClick={() => handleDownload("preview")}
              className="bg-gray-200 px-3 py-1 rounded-lg text-gray-700"
            >
              Free
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Max Quality</span>
            <span className="text-sm text-gray-500">748 x 1000</span>
            <button
              onClick={() => handleDownload("high")}
              className="bg-yellow-400 px-3 py-1 rounded-lg text-white font-bold"
            >
              Unlock
            </button>
          </div>
        </div>
      )}
    </div>
  );
}