"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("image_file", file);
    formData.append("size", "auto");

    try {
      const response = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
        headers: {
          "X-Api-Key": "Px7s7wC5nzus6jrDaFGyLbuM",
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      });

      const imgURL = URL.createObjectURL(response.data);
      localStorage.setItem("processedImage", imgURL);
      router.push("/result");
    } catch (error) {
      console.error("Error removing background:", error);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <h1 className="text-5xl font-bold text-gray-800">Remove Image Background</h1>
      <p className="text-gray-500 py-5">Get a transparent background for any image.</p>

      {/* Upload Box */}
      <div className="flex flex-col items-center justify-center bg-white shadow-2xl rounded-2xl p-8 w-110 h-90 text-center">
        <label className="cursor-pointer block">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <div className="bg-blue-500 text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-blue-600">
            Upload Image
          </div>
        </label>
        <p className="text-gray-500 mt-3">or drop a file, paste image or <a href="#" className="text-blue-500">URL</a></p>
      </div>

      {/* Loading Indicator */}
      {loading && <p className="mt-4 text-gray-700"></p>}
    </div>
  );
}