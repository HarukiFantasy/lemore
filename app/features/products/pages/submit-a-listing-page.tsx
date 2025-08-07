import React, { useState, useEffect } from "react";
import { redirect } from "react-router";
import type { Route } from "./+types/submit-a-listing-page";
import { Input } from "~/common/components/ui/input";
import { Button } from "~/common/components/ui/button";
import { Textarea } from "~/common/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { Badge } from "~/common/components/ui/badge";
import { PRICE_TYPES, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE, PRODUCT_CONDITIONS } from "../constants";
import { CURRENCIES } from '~/constants';
import { makeSSRClient } from "~/supa-client";
import { getCategories, getlocations } from '../queries';
import { createProduct, uploadProductImages, saveProductImages } from '../mutations';
import { getLetGoSession } from "~/features/let-go-buddy/mutations";
import { z } from 'zod';
import { CircleIcon } from 'lucide-react';

export const loader = async ({ request }: Route.LoaderArgs) => {
    const { client } = makeSSRClient(request);
    const { data: { user } } = await client.auth.getUser();
    if (!user) return redirect("/auth/login");

    const [categories, locations] = await Promise.all([
        getCategories(client),
        getlocations(client)
    ]);

    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");
    const isDonate = url.searchParams.get("donate") === "true";
    const fromLGB = url.searchParams.get("from_lgb") === "true";
    
    // Get direct URL parameters (new approach)
    const title = url.searchParams.get("title") || "";
    const description = url.searchParams.get("description") || "";
    const category = url.searchParams.get("category") || "";
    const imagesParam = url.searchParams.get("images");
    
    let images = [];
    if (imagesParam) {
        try {
            images = JSON.parse(imagesParam);
        } catch (error) {
            // Error parsing images parameter
        }
    }

    let letGoBuddyData = null;
    
    // If coming from LGB with URL params, use those directly
    if (fromLGB) {
        letGoBuddyData = {
            title: title,
            description: description,
            category: category,
            price: isDonate ? "0" : "",
            priceType: isDonate ? "Free" : "Fixed",
            images: images,
        };
    }
    // Fallback to session lookup (legacy approach)
    else if (sessionId) {
        try {
            const session = await getLetGoSession(client, sessionId);
            if (session.user_id === user.id) {
                letGoBuddyData = {
                    title: session.ai_listing_title || "",
                    description: session.ai_listing_description || "",
                    price: isDonate ? "0" : "",
                    priceType: isDonate ? "Free" : "Fixed",
                    images: session.image_url ? [session.image_url] : [],
                };
            }
        } catch (error) {
            // Error fetching let go buddy session
        }
    }

    return { categories, locations, letGoBuddyData };
};

const formSchema = z.object({
  title: z.string().min(1),
  price: z.string().optional(),
  currency: z.string().min(1),
  priceType: z.string().min(1),
  description: z.string().min(1),
  condition: z.string().min(1),
  category: z.string().min(1),
  location: z.string().min(1),
}).refine((data) => {
  // If price type is not "Free", price is required and must be greater than 0
  if (data.priceType !== "Free") {
    return data.price && data.price.length > 0 && parseFloat(data.price) > 0;
  }
  // If price type is "Free", price can be empty or "0"
  return true;
}, {
  message: "Price is required for non-free items",
  path: ["price"],
});

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();

  if (!user) return redirect("/auth/login");
  
  const formData = await request.formData();
  
  const imageFiles: File[] = [];
  for (let i = 0; i < 5; i++) {
    const image = formData.get(`image-${i}`) as File;
    if (image && image instanceof File) {
      imageFiles.push(image);
    }
  }
  
  const letGoBuddyImageUrls = formData.getAll("letGoBuddyImageUrls[]") as string[];

  const { success, data, error } = formSchema.safeParse(Object.fromEntries(formData));
  if (!success) {
    return { fieldErrors: error.flatten().fieldErrors };
  }
  const { title, price, currency, priceType, description, condition, category, location } = data;
  
  const finalPrice = priceType === "Free" ? "0" : (price || "0");
  
  try {
    const product = await createProduct(client, { 
      title, 
      price: parseFloat(finalPrice), 
      currency,  
      priceType, 
      userId: user.id,
      description,
      condition,
      category,
      location
    });
    
    const allImageUrls = [...letGoBuddyImageUrls];
    
    if (imageFiles.length > 0) {
      const uploadedUrls = await uploadProductImages(client, {
        productId: product.product_id,
        userId: user.id,
        images: imageFiles,
      });
      allImageUrls.push(...uploadedUrls);
    }
    
    if (allImageUrls.length > 0) {
      await saveProductImages(client, {
        productId: product.product_id,
        imageUrls: allImageUrls,
      });
    }
    
    return redirect(`/secondhand/product/${product.product_id}`);
  } catch (err: any) {
    // Error creating product
    return { error: "Failed to create product. Please try again." };
  }
};

export default function SubmitAListingPage({ loaderData, actionData }: Route.ComponentProps) {
  const { categories, locations, letGoBuddyData } = loaderData;
  
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(letGoBuddyData?.images || []);
  const [title, setTitle] = useState(letGoBuddyData?.title || "");
  const [price, setPrice] = useState(letGoBuddyData?.price || "");
  const [currency, setCurrency] = useState("THB");
  const [priceType, setPriceType] = useState(letGoBuddyData?.priceType || "");
  const [description, setDescription] = useState(letGoBuddyData?.description || "");
  const [condition, setCondition] = useState("");
  const [category, setCategory] = useState(letGoBuddyData?.category || "");
  const [location, setLocation] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (letGoBuddyData) {
      setTitle(letGoBuddyData.title || "");
      setPrice(letGoBuddyData.price || "");
      setPriceType(letGoBuddyData.priceType || "Fixed");
      setDescription(letGoBuddyData.description || "");
      setCategory(letGoBuddyData.category || "");
      if (letGoBuddyData.images && letGoBuddyData.images.length > 0) {
        setPreviews(letGoBuddyData.images);
      }
    }
  }, [letGoBuddyData]);

  const isFree = priceType === "Free";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (previews.length + files.length > 5) {
      alert("You can upload up to 5 images.");
      return;
    }
    setImages(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
  };

  const handleRemoveImage = (index: number) => {
    const newPreviews = [...previews];
    const newImages = [...images];
    
    const removedPreview = newPreviews.splice(index, 1)[0];
    
    // Check if the removed image was from a file upload or a URL
    const imageIndex = images.findIndex(file => URL.createObjectURL(file) === removedPreview);
    if (imageIndex !== -1) {
        newImages.splice(imageIndex, 1);
    }

    setPreviews(newPreviews);
    setImages(newImages);
  };
  
  // This is a simplified version, you might need more complex logic
  // to differentiate between new file uploads and existing URLs.
  const letGoBuddyUrlsInPreview = previews.filter(p => p.startsWith('http'));
  const newImageFilesForUpload = images;


  return (
    <div className="min-h-screen bg-gray-50 md:bg-white md:py-8">
      <form method="post" encType="multipart/form-data" className="flex flex-col md:flex-row gap-4 md:gap-8 w-full md:max-w-4xl md:mx-auto" onSubmit={() => setIsSubmitting(true)}>
        {/* Pass let go buddy image urls to action */}
        {letGoBuddyUrlsInPreview.map((url, index) => (
            <input type="hidden" name="letGoBuddyImageUrls[]" value={url} key={index} />
        ))}

        <div className="flex-1 flex flex-col items-center justify-center border-0 md:border rounded-none md:rounded-lg px-4 py-6 md:p-6 bg-white shadow-none md:shadow">
           {/* Image uploader UI here... */}
           <div className="w-full flex flex-col items-center cursor-pointer">
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {previews.length > 0 ? (
                  previews.map((src, idx) => (
                    <div key={`preview-${idx}`} className="relative group">
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
                disabled={previews.length >= 5}
              />
              <span className="text-xs text-neutral-500 mt-2">{previews.length}/5 images</span>
          </div>
        </div>
      
        <div className="flex-1 flex flex-col gap-4 border-0 md:border rounded-none md:rounded-lg px-4 py-6 md:p-6 bg-white shadow-none md:shadow">
            {/* Form fields here... */}
            <Input name="title" placeholder="Product Title" value={title} onChange={e => setTitle(e.target.value)} />
            <Textarea name="description" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
             <Select value={priceType} onValueChange={setPriceType}>
                 <SelectTrigger><SelectValue placeholder="Select Price Type" /></SelectTrigger>
                 <SelectContent>
                     {PRICE_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                 </SelectContent>
             </Select>
             <input type="hidden" name="priceType" value={priceType} />

             <div className="flex gap-2">
                <div className="flex-1">
                    <Input name={isFree ? "" : "price"} placeholder="Price" value={isFree ? "0" : price} onChange={e => setPrice(e.target.value)} disabled={isFree} />
                    {isFree && <input type="hidden" name="price" value="0" />}
                </div>
                <Select value={currency} onValueChange={setCurrency} disabled={isFree}>
                    <SelectTrigger className="w-20">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
                <input type="hidden" name="currency" value={currency} />
             </div>
            
            <Select value={condition} onValueChange={setCondition}>
                 <SelectTrigger><SelectValue placeholder="Select Condition" /></SelectTrigger>
                 <SelectContent>
                     {PRODUCT_CONDITIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                 </SelectContent>
            </Select>
            <input type="hidden" name="condition" value={condition} />

            <Select value={category} onValueChange={setCategory}>
                 <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                 <SelectContent>
                     {categories.map(c => <SelectItem key={c.category_id} value={c.name}>{c.name}</SelectItem>)}
                 </SelectContent>
            </Select>
            <input type="hidden" name="category" value={category} />
            
            <Select value={location} onValueChange={setLocation}>
                 <SelectTrigger><SelectValue placeholder="Select Location" /></SelectTrigger>
                 <SelectContent>
                     {locations.map(l => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}
                 </SelectContent>
            </Select>
            <input type="hidden" name="location" value={location} />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Listing"}
            </Button>
            {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
        </div>
      </form>
    </div>
  );
}
