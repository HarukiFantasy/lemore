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
import { getCategories, getlocations, getProductById, getProductImages } from '../queries';
import { updateProductImages } from '../mutations';
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
  
  // Get product images
  const productImages = await getProductImages(client, Number(productId));
  
  const categories = await getCategories(client);
  const locations = await getlocations(client);
  
  return { product, productImages, categories, locations };
};

const formSchema = z.object({
  title: z.string().min(1),
  price: z.string().optional().default("0"), // price를 optional로 변경
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
  
  // Handle image files
  const imageFiles: File[] = [];
  for (let i = 0; i < 5; i++) {
    const image = formData.get(`image-${i}`) as File;
    if (image && image instanceof File) {
      imageFiles.push(image);
    }
  }
  
  // Handle existing images
  const existingImages: string[] = [];
  for (let i = 0; i < 10; i++) {
    const existingImage = formData.get(`existing-image-${i}`) as string;
    if (existingImage) {
      existingImages.push(existingImage);
    }
  }
  
  const { success, data, error } = formSchema.safeParse(Object.fromEntries(formData));
  if (!success) {
    return { fieldErrors: error.flatten().fieldErrors };
  }
  
  const { title, price, currency, priceType, description, condition, category, location, isSold } = data;
  
  try {
    // Update product
    const { data: categoryData, error: categoryError } = await client
      .from("categories")
      .select("category_id")
      .eq("name", category as any)
      .single();
      
    if (categoryError) {
      throw categoryError;
    }
    
    const updateData = {
      title,
      price: priceType === "Free" ? 0 : parseFloat(price || "0"),
      currency,
      price_type: priceType as any,
      description,
      condition: condition as any,
      location: location as any,
      category_id: categoryData.category_id,
      is_sold: isSold === "true",
      updated_at: new Date().toISOString()
    };
    
    const { error: updateError } = await client
      .from("products")
      .update(updateData)
      .eq("product_id", Number(productId))
      .eq("seller_id", user.id); // Ensure only the seller can update
      
    if (updateError) {
      throw updateError;
    }
    
    // Update images if any changes
    if (imageFiles.length > 0 || existingImages.length > 0) {
      try {
        await updateProductImages(client, {
          productId: Number(productId),
          newImages: imageFiles,
          existingImages: existingImages,
          userId: user.id,
        });
      } catch (imageError) {
        // 이미지 업데이트 실패해도 제품 업데이트는 성공으로 처리
        console.error("Image update failed:", imageError);
      }
    }
    
    // Get location from URL params to preserve it in redirect
    const url = new URL(request.url);
    const locationParam = url.searchParams.get("location");
    const redirectUrl = locationParam && locationParam !== "Bangkok" 
      ? `/secondhand/product/${productId}?location=${locationParam}`
      : `/secondhand/product/${productId}`;
      
    return redirect(redirectUrl);
  } catch (error) {
    console.error("Error updating product:", error);
    return { error: "Failed to update product. Please try again." };
  }
};

export default function EditProductPage({ loaderData, actionData }: Route.ComponentProps) {
  const { product, productImages, categories, locations } = loaderData;
  
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    productImages.map((img: any) => img.image_url)
  );
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

        {/* Error Message */}
        {actionData?.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{actionData.error}</p>
          </div>
        )}

        <Form 
          method="post" 
          encType="multipart/form-data"
          className="flex flex-col md:flex-row gap-8"
          onSubmit={() => setIsSubmitting(true)}
        >
          {/* Hidden file inputs for form submission */}
          {images.map((_, index) => (
            <input
              key={index}
              name={`image-${index}`}
              type="file"
              accept="image/*"
              className="hidden"
              ref={(input) => {
                if (input && images[index]) {
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(images[index]);
                  input.files = dataTransfer.files;
                }
              }}
            />
          ))}
          
          {/* Hidden inputs for existing images */}
          {existingImages.map((imageUrl, index) => (
            <input
              key={`existing-${index}`}
              name={`existing-image-${index}`}
              type="hidden"
              value={imageUrl}
            />
          ))}
          
          {/* Left: Image Upload */}
          <div className="flex-1 flex flex-col items-center justify-center border rounded-lg p-6 bg-white shadow">
            <div className="w-full flex flex-col items-center">
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {/* Existing Images */}
                {existingImages.map((imageUrl, idx) => (
                  <div key={`existing-${idx}`} className="relative group">
                    <img src={imageUrl} alt={`Existing ${idx + 1}`} className="w-24 h-24 object-cover rounded" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setExistingImages(prev => prev.filter((_, i) => i !== idx));
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {/* New Images */}
                {previews.map((src, idx) => (
                  <div key={`new-${idx}`} className="relative group">
                    <img src={src} alt={`Preview ${idx + 1}`} className="w-24 h-24 object-cover rounded" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(idx)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {/* Upload placeholder */}
                {existingImages.length === 0 && previews.length === 0 && (
                  <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded text-gray-400">
                    Click to upload images
                  </div>
                )}
              </div>
              
              {/* Upload button */}
              <label className="cursor-pointer inline-block">
                <div className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                  Add Images
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  multiple
                  onChange={handleImageChange}
                  disabled={existingImages.length + images.length >= 5}
                />
              </label>
              
              <span className="text-xs text-neutral-500 mt-2">
                {existingImages.length + images.length}/5 images
              </span>
              <span className="text-xs text-gray-400 mt-1">
                Supported formats: JPEG, PNG, WebP (max 10MB each)
              </span>
            </div>
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
                  <Select value={currency} onValueChange={setCurrency}>
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
                  <input type="hidden" name="currency" value={currency} />
                </div>
              </div>

              {/* Price Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Type *
                </label>
                  <Select value={priceType} onValueChange={(value) => setPriceType(value as any)}>
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
                  <input type="hidden" name="priceType" value={priceType} />
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                  <Select value={condition} onValueChange={(value) => setCondition(value as any)}>
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
                  <input type="hidden" name="condition" value={condition} />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                  <Select value={category} onValueChange={(value) => setCategory(value as any)}>
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
                  <input type="hidden" name="category" value={category} />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                  <Select value={location} onValueChange={(value) => setLocation(value as any)}>
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
                  <input type="hidden" name="location" value={location} />
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