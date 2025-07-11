import React, { useState, useEffect } from "react";
import { Input } from "~/common/components/ui/input";
import { Button } from "~/common/components/ui/button";
import { Textarea } from "~/common/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { Badge } from "~/common/components/ui/badge";
import { useNavigate, useLocation, redirect, Form } from "react-router";
import { PRICE_TYPES,ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE, PRODUCT_CONDITIONS} from "../constants";
import { CURRENCIES } from '~/constants';
import { Route } from "./+types/submit-a-listing-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/users/queries";
import { getCategories, getlocations } from '../queries';
import { createProduct } from '../mutations';
import { z } from 'zod';
import { CircleIcon } from 'lucide-react';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  await getLoggedInUserId(client);
  const categories = await getCategories(client);
  const locations = await getlocations(client);
  return { categories, locations };
};

const formSchema = z.object({
  title: z.string().min(1),
  price: z.string().min(1),
  currency: z.string().min(1),
  priceType: z.string().min(1),
  description: z.string().min(1),
  condition: z.string().min(1),
  category: z.string().min(1),
  location: z.string().min(1),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);

  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) {
    return redirect("/auth/login");
  }
  const formData = await request.formData();
  const { success, data, error } = formSchema.safeParse(Object.fromEntries(formData));
  if (!success) {
    return { fieldErrors: error.flatten().fieldErrors };
  }
  const { title, price, currency, priceType, description, condition, category, location } = data;
  const product  = await createProduct(client, { 
    title, 
    price: parseFloat(price), 
    currency,  
    priceType, 
    userId: user.id,
    description,
    condition,
    category,
    location
  });
  
  // Get location from URL params to preserve it in redirect
  const url = new URL(request.url);
  const locationParam = url.searchParams.get("location");
  const redirectUrl = locationParam && locationParam !== "Bangkok" 
    ? `/secondhand/product/${product.product_id}?location=${locationParam}`
    : `/secondhand/product/${product.product_id}`;
    
  return redirect(redirectUrl);
};

export default function SubmitAListingPage({loaderData, actionData }: Route.ComponentProps) {
  const { categories, locations } = loaderData;
  
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("THB");
  const [priceType, setPriceType] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();
  const locationState = useLocation();
  const prefillData = locationState.state?.prefillData;
  const fromLetGoBuddy = locationState.state?.fromLetGoBuddy;
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Auto-fill form with data from Let Go Buddy
  useEffect(() => {
    if (prefillData && fromLetGoBuddy) {
      setTitle(prefillData.title || "");
      setPrice(prefillData.price !== undefined && prefillData.price !== null ? String(prefillData.price) : "");
      setCurrency(prefillData.currency || "THB");
      // 무료나눔 상태가 있으면 priceType을 Free로 강제 세팅
      if (prefillData.priceType) {
        setPriceType(prefillData.priceType);
      } else if (prefillData.isGiveaway) {
        setPriceType("Free");
      } else {
        setPriceType("Fixed");
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

  const isFree = priceType === "Free";

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

  return (
    <Form method="post" className="flex flex-col md:flex-row gap-8 p-8 max-w-4xl mx-auto">
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
        </label>
      </div>
      
      {/* Right: Product Details */}
      <div className="flex-1 flex flex-col gap-4 border rounded-lg p-6 bg-white shadow">
        <div>
          <Input
            type="text"
            name="title"
            placeholder="Product Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={actionData && "fieldErrors" in actionData && actionData.fieldErrors.title ? "border-red-500" : ""}
          />
          {actionData && "fieldErrors" in actionData && ( 
            <div className="text-xs text-red-500 mt-1">
              {actionData.fieldErrors.title}
            </div>
          )}
          </div>
        <div>
          <input type="hidden" name="priceType" value={priceType} />
          <Select value={priceType} onValueChange={setPriceType}>
            <SelectTrigger className={actionData && "fieldErrors" in actionData && actionData.fieldErrors.priceType ? "border-red-500" : ""}>
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
          {actionData && "fieldErrors" in actionData && (
            <div className="text-xs text-red-500 mt-1">
              {actionData.fieldErrors.priceType}
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  name="price"
                  placeholder="0"
                  value={isFree ? "0" : price}
                  onChange={e => {
                    if (!isFree) {
                      // 숫자와 쉼표만 허용
                      const value = e.target.value.replace(/[^0-9,]/g, '');
                      setPrice(value);
                    }
                  }}
                  className={`${actionData && "fieldErrors" in actionData && actionData.fieldErrors.price ? "border-red-500" : ""} ${
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
              <input type="hidden" name="currency" value={currency} />
              <Select value={currency} onValueChange={setCurrency} disabled={isFree}>
                <SelectTrigger className={`w-20 ${isFree ? "bg-green-50 border-green-300" : ""}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency: string) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {actionData && "fieldErrors" in actionData && (
            <div className="text-xs text-red-500">
              {actionData.fieldErrors.price}
            </div>
          )}
          
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
            name="description"
            placeholder="Description & Specifications"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className={`min-h-[100px] ${actionData && "fieldErrors" in actionData && actionData.fieldErrors.description ? "border-red-500" : ""}`}
          />
          {actionData && "fieldErrors" in actionData && (
            <div className="text-xs text-red-500 mt-1">
              {actionData.fieldErrors.description}
            </div>
          )}
        </div>
        
        <div>
          <input type="hidden" name="condition" value={condition} />
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger className={actionData && "fieldErrors" in actionData && actionData.fieldErrors.condition ? "border-red-500" : ""}>
              <SelectValue placeholder="Select Condition" />
            </SelectTrigger>
            <SelectContent> 
              {PRODUCT_CONDITIONS.map((condition: any) => (
                <SelectItem key={condition.value} value={condition.value}>
                  {condition.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {actionData && "fieldErrors" in actionData && (
            <div className="text-xs text-red-500 mt-1">
              {actionData.fieldErrors.condition}
            </div>
          )}
        </div>
        
        <div>
          <input type="hidden" name="category" value={category} />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className={actionData && "fieldErrors" in actionData && actionData.fieldErrors.category ? "border-red-500" : ""}>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category: any) => (
                <SelectItem key={category.category_id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {actionData && "fieldErrors" in actionData && (
            <div className="text-xs text-red-500 mt-1">
              {actionData.fieldErrors.category}
            </div>
          )}
        </div>
        
        <div>
          <input type="hidden" name="location" value={location} />
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className={actionData && "fieldErrors" in actionData && actionData.fieldErrors.location ? "border-red-500" : ""}>
              <SelectValue placeholder="Select Location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location: any) => (
                <SelectItem key={location.id} value={location.name}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {actionData && "fieldErrors" in actionData && (
            <div className="text-xs text-red-500 mt-1">
              {actionData.fieldErrors.location}
            </div>
          )}
        </div>
          
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <CircleIcon className="animate-spin" /> : "Create account"}
        </Button>
      </div>
    </Form>
  );
} 