import React, { useState, useEffect } from "react";
import { Input } from "~/common/components/ui/input";
import { Button } from "~/common/components/ui/button";
import { Textarea } from "~/common/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { Badge } from "~/common/components/ui/badge";
import { Checkbox } from "~/common/components/ui/checkbox";

import { useNavigate, useLocation, redirect, Form } from "react-router";
import { PRICE_TYPES, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE, PRODUCT_CONDITIONS } from "../constants";
import { CURRENCIES } from '~/constants';
import { Route } from "./+types/edit-product-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/users/queries";
import { getCategories, getlocations, getProductById } from '../queries';
import { z } from 'zod';
import { CircleIcon, ArrowLeft } from 'lucide-react';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { productId } = params;
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  
  // Get product data
  const product = await getProductById(client, Number(productId));
  
  // Check if current user is the seller
  if (product.seller_id !== userId) {
    throw redirect("/secondhand/product/" + productId);
  }
  
  const categories = await getCategories(client);
  const locations = await getlocations(client);
  
  return { product, categories, locations };
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
  isSold: z.string().optional(),
});

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { productId } = params;
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
  
  const { title, price, currency, priceType, description, condition, category, location, isSold } = data;
  
  // Update product
  const { data: categoryData, error: categoryError } = await client
    .from("categories")
    .select("category_id")
    .eq("name", category as any)
    .single();
    
  if (categoryError) {
    throw categoryError;
  }
  
  const { error: updateError } = await client
    .from("products")
    .update({
      title,
      price: parseFloat(price),
      currency,
      price_type: priceType as any,
      description,
      condition: condition as any,
      location: location as any,
      category_id: categoryData.category_id,
      is_sold: isSold === "true",
      updated_at: new Date().toISOString()
    })
    .eq("product_id", Number(productId))
    .eq("seller_id", user.id); // Ensure only the seller can update
    
  if (updateError) {
    throw updateError;
  }
  
  // Get location from URL params to preserve it in redirect
  const url = new URL(request.url);
  const locationParam = url.searchParams.get("location");
  const redirectUrl = locationParam && locationParam !== "Bangkok" 
    ? `/secondhand/product/${productId}?location=${locationParam}`
    : `/secondhand/product/${productId}`;
    
  return redirect(redirectUrl);
};

export default function EditProductPage({ loaderData, actionData }: Route.ComponentProps) {
  const { product, categories, locations } = loaderData;
  
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [title, setTitle] = useState(product.title || "");
  const [price, setPrice] = useState(product.price ? String(product.price) : "");
  const [currency, setCurrency] = useState(product.currency || "THB");
  const [priceType, setPriceType] = useState(product.price_type || "");
  const [description, setDescription] = useState(product.description || "");
  const [condition, setCondition] = useState(product.condition || "");
  const [category, setCategory] = useState(product.category_name || "");
  const [location, setLocation] = useState(product.location || "");
  const [isSold, setIsSold] = useState(product.is_sold || false);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/secondhand/product/${product.product_id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Product
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        </div>

        <Form 
          method="post" 
          className="flex flex-col md:flex-row gap-8"
          onSubmit={() => setIsSubmitting(true)}
        >
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
          
          {/* Right: Form */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter product title"
                  required
                />
              </div>

              {/* Price and Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <Input
                    name="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    disabled={isFree}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency *
                  </label>
                  <Select name="currency" value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                                         <SelectContent>
                       {CURRENCIES.map((currency) => (
                         <SelectItem key={currency} value={currency}>
                           {currency}
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Type *
                </label>
                                  <Select name="priceType" value={priceType} onValueChange={(value) => setPriceType(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                                  <Select name="condition" value={condition} onValueChange={(value) => setCondition(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CONDITIONS.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                                  <Select name="category" value={category} onValueChange={(value) => setCategory(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                                  <Select name="location" value={location} onValueChange={(value) => setLocation(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location: any) => (
                        <SelectItem key={location.name} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <Textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your product..."
                  rows={4}
                  required
                />
              </div>

              {/* Sold Status */}
              <div className="flex items-center space-x-2">
                <input type="hidden" name="isSold" value={isSold ? "true" : "false"} />
                <Checkbox
                  id="isSold"
                  checked={isSold}
                  onCheckedChange={(checked) => setIsSold(checked as boolean)}
                />
                <label
                  htmlFor="isSold"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Mark as Sold
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Product"}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
} 