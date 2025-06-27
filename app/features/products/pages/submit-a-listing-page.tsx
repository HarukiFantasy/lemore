import React, { useState } from "react";
import { Input } from "~/common/components/ui/input";
import { Button } from "~/common/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { useNavigate } from "react-router";
import { productFormSchema, type ProductFormData } from "~/lib/schemas";
import { PRODUCT_CATEGORIES } from "../categories";
import { LOCATIONS } from "~/common/data/locations";

export default function SubmitAListingPage() {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const validateForm = (): boolean => {
    const formData: ProductFormData = {
      title,
      price,
      description,
      condition: condition as any,
      category,
      location,
      images,
    };

    const result = productFormSchema.safeParse(formData);
    
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(error => {
        const field = error.path.join('.');
        newErrors[field] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

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
          {errors.images && <span className="text-xs text-red-500 mt-1">{errors.images}</span>}
        </label>
      </div>
      
      {/* Right: Product Details */}
      <div className="flex-1 flex flex-col gap-4 border rounded-lg p-6 bg-white shadow">
        <div>
          <Input
            type="text"
            placeholder="Product Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && <span className="text-xs text-red-500 mt-1">{errors.title}</span>}
        </div>
        
        <div>
          <Input
            type="text"
            placeholder="Price (e.g., THB 1000)"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && <span className="text-xs text-red-500 mt-1">{errors.price}</span>}
        </div>
        
        <div>
          <textarea
            className={`border rounded p-2 min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          {errors.description && <span className="text-xs text-red-500 mt-1">{errors.description}</span>}
        </div>
        
        <div>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger className={errors.condition ? "border-red-500" : ""}>
              <SelectValue placeholder="Select Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Like New">Like New</SelectItem>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
              <SelectItem value="Poor">Poor</SelectItem>
            </SelectContent>
          </Select>
          {errors.condition && <span className="text-xs text-red-500 mt-1">{errors.condition}</span>}
        </div>
        
        <div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className={errors.category ? "border-red-500" : ""}>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map(cat => (
                <SelectItem key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <span className="text-xs text-red-500 mt-1">{errors.category}</span>}
        </div>
        
        <div>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className={errors.location ? "border-red-500" : ""}>
              <SelectValue placeholder="Select Location" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.location && <span className="text-xs text-red-500 mt-1">{errors.location}</span>}
        </div>
        
        <Button type="submit" className="mt-4">Submit Listing</Button>
      </div>
    </form>
  );
} 