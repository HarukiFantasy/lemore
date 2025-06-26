import React, { useState } from "react";
import { Input } from "~/common/components/ui/input";
import { Button } from "~/common/components/ui/button";
import { useNavigate } from "react-router";

export default function SubmitAListingPage() {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const totalFiles = images.length + files.length;
    if (totalFiles > 5) {
      alert("You can upload up to 5 images.");
      return;
    }
    setImages(prev => [...prev, ...files]);
    setPreviews(prev => [
      ...prev,
      ...files.map(file => URL.createObjectURL(file))
    ]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally upload the product and get its ID
    // For now, redirect to a sample product detail page
    navigate("/secondhand/product/0");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8 p-8 max-w-4xl mx-auto">
      {/* Left: Image Upload */}
      <div className="flex-1 flex flex-col items-center justify-center border rounded-lg p-6 bg-white shadow">
        <label className="w-full flex flex-col items-center cursor-pointer">
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {previews.length > 0 ? (
              previews.map((src, idx) => (
                <div key={idx} className="relative group">
                  <img src={src} alt={`Preview ${idx + 1}`} className="w-24 h-24 object-cover rounded" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(idx)}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded text-gray-400">
                Click to upload images
              </div>
            )}
          </div>
          <Input
            type="file"
            accept="image/*"
            className="hidden"
            multiple
            onChange={handleImageChange}
            disabled={images.length >= 5}
          />
          <span className="text-xs text-neutral-500 mt-2">{images.length}/5 images</span>
        </label>
      </div>
      {/* Right: Product Details */}
      <div className="flex-1 flex flex-col gap-4 border rounded-lg p-6 bg-white shadow">
        <Input
          type="text"
          placeholder="Product Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="Price (e.g., THB 1000)"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
        />
        <textarea
          className="border rounded p-2 min-h-[100px]"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <Button type="submit" className="mt-4">Submit Listing</Button>
      </div>
    </form>
  );
} 