import React, { useState, useEffect } from "react";
import { Input } from "~/common/components/ui/input";
import { Button } from "~/common/components/ui/button";
import { Textarea } from "~/common/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { Badge } from "~/common/components/ui/badge";
import { useNavigate, useLocation } from "react-router";
import { PRODUCT_CATEGORIES, PRICE_TYPES, PRODUCT_LIMITS, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "../constants";
import { LOCATIONS } from "~/constants";

// Mock data for form validation
const mockFormData = {
  title: "",
  price: "",
  currency: "THB",
  description: "",
  condition: "",
  category: "",
  location: "",
  images: [] as File[],
};

export default function SubmitAListingPage() {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("THB");
  const [priceType, setPriceType] = useState("fixed");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const locationState = useLocation();
  const prefillData = locationState.state?.prefillData;
  const fromLetGoBuddy = locationState.state?.fromLetGoBuddy;

  // Auto-fill form with data from Let Go Buddy
  useEffect(() => {
    if (prefillData && fromLetGoBuddy) {
      setTitle(prefillData.title || "");
      setPrice(prefillData.price !== undefined && prefillData.price !== null ? String(prefillData.price) : "");
      setCurrency(prefillData.currency || "THB");
      // 무료나눔 상태가 있으면 priceType을 free로 강제 세팅
      if (prefillData.priceType) {
        setPriceType(prefillData.priceType);
      } else if (prefillData.isGiveaway) {
        setPriceType("free");
      } else {
        setPriceType("fixed");
      }
      setDescription(prefillData.description || "");
      setCondition(prefillData.condition || "");
      setCategory(prefillData.category || "");
      setLocation(prefillData.location || "");
      // Handle images from Let Go Buddy
      if (prefillData.images && prefillData.images.length > 0) {
        setImages(prefillData.images);
        setPreviews(prefillData.images.map((file: File) => URL.createObjectURL(file)));
      }
    }
  }, [prefillData, fromLetGoBuddy]);

  const isFree = priceType === "free";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const totalFiles = images.length + files.length;
    
    if (totalFiles > 5) {
      alert("You can upload up to 5 images.");
      return;
    }

    // MIME 타입 검증
    const invalidFiles = files.filter(file => 
      !ALLOWED_IMAGE_TYPES.includes(file.type as any)
    );
    
    if (invalidFiles.length > 0) {
      const invalidTypes = invalidFiles.map(file => file.type).join(", ");
      alert(`Invalid file type(s): ${invalidTypes}. Only JPEG, PNG, and WebP images are allowed.`);
      return;
    }

    // 파일 크기 검증
    const oversizedFiles = files.filter(file => 
      file.size > MAX_FILE_SIZE
    );
    
    if (oversizedFiles.length > 0) {
      const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
      alert(`File(s) too large. Maximum file size is ${maxSizeMB}MB.`);
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
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    // Price validation (only for non-free items)
    if (!isFree) {
      if (!price.trim()) {
        newErrors.price = "Price is required";
      } else if (isNaN(Number(price.replace(/,/g, '')))) {
        newErrors.price = "Price must be a valid number";
      }
    }

    // Currency validation
    if (!currency) {
      newErrors.currency = "Currency is required";
    }

    // Description validation
    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (description.length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    // Condition validation
    if (!condition) {
      newErrors.condition = "Condition is required";
    }

    // Category validation
    if (!category) {
      newErrors.category = "Category is required";
    }

    // Location validation
    if (!location) {
      newErrors.location = "Location is required";
    }

    // Images validation
    if (images.length === 0) {
      newErrors.images = "At least one image is required";
    } else if (images.length > 5) {
      newErrors.images = "Maximum 5 images allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Mock data for submission
    const mockProductData = {
      id: Date.now().toString(),
      title,
      price: isFree ? 0 : Number(price.replace(/,/g, '')),
      currency,
      priceType,
      description,
      condition,
      category,
      location,
      images: images.length,
      createdAt: new Date().toISOString(),
      sellerId: "mock-seller-123",
      isSold: false,
    };

    console.log("Submitting product:", mockProductData);

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
          <span className="text-xs text-gray-400 mt-1">
            Supported formats: JPEG, PNG, WebP (max 10MB each)
          </span>
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
          <Select value={priceType} onValueChange={setPriceType}>
            <SelectTrigger className={errors.priceType ? "border-red-500" : ""}>
              <SelectValue placeholder="Select Price Type" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.priceType && <span className="text-xs text-red-500 mt-1">{errors.priceType}</span>}
        </div>
        
        <div className="space-y-3">
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="0"
                  value={isFree ? "0" : price}
                  onChange={e => {
                    if (!isFree) {
                      // 숫자와 쉼표만 허용
                      const value = e.target.value.replace(/[^0-9,]/g, '');
                      setPrice(value);
                    }
                  }}
                  className={`${errors.price ? "border-red-500" : ""} ${
                    isFree ? "bg-green-50 border-green-300 text-green-700" : ""
                  } pr-12 text-lg font-medium`}
                  disabled={isFree}
                />
                {!isFree && price && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium" />
                )}
                {isFree && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-green-600 font-medium" />
                )}
              </div>
              <Select value={currency} onValueChange={setCurrency} disabled={isFree}>
                <SelectTrigger className={`w-20 ${isFree ? "bg-green-50 border-green-300" : ""}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="THB">THB</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="KRW">KRW</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {errors.price && <span className="text-xs text-red-500">{errors.price}</span>}
          {errors.currency && <span className="text-xs text-red-500">{errors.currency}</span>}
          
          {isFree && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                🎁 Free item
              </Badge>
              <span className="text-xs text-green-600">No payment required</span>
            </div>
          )}
        </div>
        
        <div>
          <Textarea
            placeholder="Description & Specifications"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className={`min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
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
                <SelectItem key={cat} value={cat}>
                  {cat}
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