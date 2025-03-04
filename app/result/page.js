"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaDownload } from "react-icons/fa";
import { IoIosRemove, IoIosAdd } from "react-icons/io";
import { TbFlipHorizontal, TbFlipVertical } from "react-icons/tb";
import { IoArrowUndo, IoArrowRedo } from "react-icons/io5";
import { AiOutlinePicture } from "react-icons/ai";
import { MdOutlineBrush, MdOutlineAutoFixHigh } from "react-icons/md";
import { SiCanva } from "react-icons/si";
import DownloadButton from "../components/DownloadButton";
import { FiPlus } from "react-icons/fi";


export default function ResultPage() {
  const router = useRouter();
  const [images, setImages] = useState([]); // Multiple images array
  const [selectedImage, setSelectedImage] = useState(null); // Current selected image
  const [background, setBackground] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [history, setHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [showModal, setShowModal] = useState(false); // ✅ Define showModal
  const [backgrounds, setBackgrounds] = useState([]);

  const imgRef = useRef(null);

  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const response = await fetch(
          "https://api.pexels.com/v1/search?query=background&per_page=9",
          {
            method: "GET",
            headers: {
              Authorization:
                "GaD6R2YthUBaKbHSCwQ8uVkNBJZvWQREtIGkmtOm6UnmN3QtFLLpxdNH", // 🔥 Your Pexels API Key
            },
          }
        );

        const data = await response.json();
        setBackgrounds(data.photos); // ✅ API se aayi images store karna
      } catch (error) {
        console.error("Error fetching backgrounds:", error);
      }
    };

    fetchBackgrounds();
  }, []);

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);

    const processedImages = await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append("image_file", file);
        formData.append("size", "auto");

        try {
          const response = await fetch("https://api.remove.bg/v1.0/removebg", {
            method: "POST",
            headers: {
              "X-Api-Key": "Px7s7wC5nzus6jrDaFGyLbuM",
            },
            body: formData,
          });

          if (!response.ok) {
            console.error("Error removing background");
            return null;
          }

          const blob = await response.blob();
          return URL.createObjectURL(blob);
        } catch (error) {
          console.error("Error:", error);
          return null;
        }
      })
    );

    const validImages = processedImages.filter((img) => img !== null);

    if (validImages.length > 0) {
      setImages((prevImages) => [...prevImages, ...validImages]);
      if (!selectedImage) {
        setSelectedImage(validImages[0]);
      }
    }
  };

  const handleImageClick = async (img) => {
    setSelectedImage(null); // Temporarily remove to show loading state

    try {
      const response = await fetch(img);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("image_file", blob);
      formData.append("size", "auto");

      const bgRemovedResponse = await fetch(
        "https://api.remove.bg/v1.0/removebg",
        {
          method: "POST",
          headers: {
            "X-Api-Key": "Px7s7wC5nzus6jrDaFGyLbuM",
          },
          body: formData,
        }
      );

      if (!bgRemovedResponse.ok) {
        console.error("Error removing background");
        setSelectedImage(img); // Restore original image if error occurs
        return;
      }

      const bgRemovedBlob = await bgRemovedResponse.blob();
      const processedImage = URL.createObjectURL(bgRemovedBlob);

      setSelectedImage(processedImage);
      setImages((prevImages) =>
        prevImages.map((image) => (image === img ? processedImage : image))
      );
    } catch (error) {
      console.error("Error processing image:", error);
      setSelectedImage(img);
    }
  };

  // const handleImageUpload = (event) => {
  //   const files = Array.from(event.target.files);
  //   const imageUrls = files.map((file) => URL.createObjectURL(file));
  //   setImages((prevImages) => [...prevImages, ...imageUrls]);
  //   if (!selectedImage) {
  //     setSelectedImage(imageUrls[0]); // First uploaded image is selected
  //   }
  // };

  const handleDeleteImage = (imageToDelete) => {
    setImages((prevImages) => {
      const updatedImages = prevImages.filter((img) => img !== imageToDelete);

      if (updatedImages.length === 0) {
        router.push("/"); // Redirect to home if no images are left
      } else if (selectedImage === imageToDelete) {
        setSelectedImage(updatedImages[0]); // Select the first remaining image
      }

      return updatedImages;
    });
  };

  const saveToHistory = () => {
    setHistory((prev) => [...prev, { scale, rotation, background }]);
    setRedoHistory([]);
  };

  const handleZoomIn = () => {
    saveToHistory();
    setScale((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    saveToHistory();
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleFlipHorizontal = () => {
    saveToHistory();
    setRotation((prev) => (prev === 180 ? 0 : 180));
  };

  const handleFlipVertical = () => {
    saveToHistory();
    setRotation((prev) => (prev === 90 ? 270 : 90));
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const lastState = history.pop();
      setRedoHistory((prev) => [...prev, { scale, rotation, background }]);
      setScale(lastState.scale);
      setRotation(lastState.rotation);
      setBackground(lastState.background);
      setHistory([...history]);
    }
  };

  const handleRedo = () => {
    if (redoHistory.length > 0) {
      const nextState = redoHistory.pop();
      setHistory((prev) => [...prev, { scale, rotation, background }]);
      setScale(nextState.scale);
      setRotation(nextState.rotation);
      setBackground(nextState.background);
      setRedoHistory([...redoHistory]);
    }
  };

  const handleDownload = () => {
    if (selectedImage) {
      // ✅ Correct variable used
      const link = document.createElement("a");
      link.href = selectedImage;
      link.download = "edited-image.png";
      link.click();
    }
  };

  const handleBackgroundChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBackground(URL.createObjectURL(file));
      setShowBackgroundModal(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-6">
      {/* Image Display Section */}
      <div className="relative w-96 h-96 bg-white rounded-lg border-gray-400 flex items-center justify-center overflow-hidden">
        {background && (
          <img
            src={background}
            alt="Background"
            className="absolute w-full h-full object-cover"
          />
        )}
        {selectedImage ? (
          <img
            ref={imgRef}
            src={selectedImage}
            alt="Processed"
            className="relative max-w-full max-h-full rounded-lg transition-transform duration-300"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              objectFit: "contain",
            }}
          />
        ) : (
          <p className="text-gray-500">Loading...</p>
        )}
      </div>

      {/* Bottom-Left: Thumbnail & Upload Button */}
      <div className="absolute bottom-15 left-4 flex items-center space-x-3 bg-white p-2 rounded-lg ">
        {/* Upload Button */}
        <label className="cursor-pointer flex items-center justify-center p-8 border border-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200">
          <FiPlus className="text-xl text-gray-600" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
        {/* Thumbnails */}
        <div className="flex space-x-2 overflow-x-auto w-[250px]">
          {images.map((img, index) => (
            <div key={index} className="relative">
              <img
                src={img}
                alt={`Thumbnail ${index}`}
                className="w-21 h-21 rounded-lg object-cover border border-gray-300 cursor-pointer"
                onClick={() => setSelectedImage(img)}
              />
              <button
                onClick={() => handleDeleteImage(img)}
                className="absolute top-1 right-0 bg-black text-white text-xs text-black p-0 rounded-full"
                style={{ color: "black" }}
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Controls Section (Below Image) */}
      <div className="flex items-center space-x-4 mt-4 bg-white p-3">
        <button onClick={handleZoomOut} className="p-2 rounded-full">
          <IoIosRemove className="text-xl" />
        </button>
        <button onClick={handleZoomIn} className="p-2 rounded-full ">
          <IoIosAdd className="text-xl" />
        </button>
        <button onClick={handleFlipHorizontal} className="p-2 rounded-full ">
          <TbFlipHorizontal className="text-xl" />
        </button>
        <button onClick={handleFlipVertical} className="p-2 rounded-full ">
          <TbFlipVertical className="text-xl" />
        </button>
        <button onClick={handleUndo} className="p-2 rounded-full ">
          <IoArrowUndo className="text-xl" />
        </button>
        <button onClick={handleRedo} className="p-2 rounded-full ">
          <IoArrowRedo className="text-xl" />
        </button>
        {/* <button
          onClick={handleDownload}
          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
        >
          <FaDownload className="mr-2" /> Download
        </button> */}
        <div className="mt-4">
          <DownloadButton image={selectedImage} />
        </div>
      </div>

      {/* Right Side Extra Buttons */}
      <div className="absolute right-90 top-15 flex flex-col space-y-3">
        <div className="relative">
          {/* Background Button */}
          <button
            onClick={() => setShowModal(!showModal)}
            className="flex items-center px-4 py-2 rounded-lg text-gray-700 cursor-pointer"
          >
            <span className="p-2 border border-gray-400 rounded-full mr-2">
              <AiOutlinePicture className="text-xl" />
            </span>
            Background
          </button>

          {/* Background Selection Modal */}
          {showModal && (
            <div className="absolute top-12 right-0 w-64 bg-white shadow-lg rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Choose Background</span>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ✖
                </button>
              </div>

              {/* Backgrounds Grid */}
              <div className="grid grid-cols-3 gap-2">
                {backgrounds.map((bg, index) => (
                  <img
                    key={index}
                    src={bg.src.medium} // ✅ API se aayi image ka URL
                    alt="Background option"
                    className="w-16 h-16 object-cover rounded cursor-pointer"
                    onClick={() => setBackground(bg.src.large)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* <button
          onClick={() => setShowBackgroundModal(true)}
          className="flex items-center px-4 py-2 rounded-lg text-gray-700 cursor-pointer"
        >
          <span className="p-2 border border-gray-400 rounded-full mr-2">
            <AiOutlinePicture className="text-xl" />
          </span>
          Background
        </button> */}
        <button className="flex items-center px-4 py-2 rounded-lg text-gray-700 cursor-pointer">
          <span className="p-2 border border-gray-400 rounded-full mr-2">
            <MdOutlineBrush className="text-xl" />
          </span>
          Erase/Restore
        </button>
        <button className="flex items-center px-4 py-2 rounded-lg text-gray-700 cursor-pointer">
          <span className="p-2 border border-gray-400 rounded-full mr-2">
            <MdOutlineAutoFixHigh className="text-xl" />
          </span>
          Effects
        </button>
        <button className="flex items-center px-4 py-2 rounded-lg text-gray-700 cursor-pointer">
          <span className="p-2 border border-gray-400 rounded-full mr-2">
            <SiCanva className="text-xl text-blue-500" />
          </span>
          Create Design
        </button>
      </div>
    </div>
  );
}
