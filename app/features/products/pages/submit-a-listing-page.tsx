import React, { useState, useEffect } from "react";
import { json, redirect, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation } from "@remix-run/react";
import { Input } from "~/common/components/ui/input";
import { Button } from "~/common/components/ui/button";
import { Textarea } from "~/common/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { Badge } from "~/common/components/ui/badge";
import { PRICE_TYPES, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE, PRODUCT_CONDITIONS } from "../constants";
import { CURRENCIES } from '~/constants';
import { createSupaClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/users/queries";
import { getCategories, getlocations } from '../queries';
import { createProduct, uploadProductImages, saveProductImages } from '../mutations';
import { getLetGoSession } from "../../../let-go-buddy/mutations";
import { z } from 'zod';
import { CircleIcon } from 'lucide-react';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { supabase, serverSession, headers } = createSupaClient(request);
    if (!serverSession) return redirect("/login", { headers });

    const [categories, locations] = await Promise.all([
        getCategories(supabase),
        getlocations(supabase)
    ]);

    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");
    const isDonate = url.searchParams.get("donate") === "true";

    let letGoBuddyData = null;
    if (sessionId) {
        try {
            const session = await getLetGoSession(supabase, sessionId);
            if (session.user_id === serverSession.user.id) {
                letGoBuddyData = {
                    title: session.ai_listing_title || "",
                    description: session.ai_listing_description || "",
                    price: isDonate ? "0" : "",
                    priceType: isDonate ? "Free" : "Fixed",
                    images: session.image_url ? [session.image_url] : [],
                };
            }
        } catch (error) {
            console.error("Error fetching let go buddy session:", error);
        }
    }

    return json({ categories, locations, letGoBuddyData }, { headers });
};

const formSchema = z.object({
  title: z.string().min(1),
  price: z.string().min(1).optional(),
  currency: z.string().min(1),
  priceType: z.string().min(1),
  description: z.string().min(1),
  condition: z.string().min(1),
  category: z.string().min(1),
  location: z.string().min(1),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, serverSession } = createSupaClient(request);

  if (!serverSession) return redirect("/auth/login");
  
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
    return json({ fieldErrors: error.flatten().fieldErrors });
  }
  const { title, price, currency, priceType, description, condition, category, location } = data;
  
  const finalPrice = priceType === "Free" ? "0" : (price || "0");
  
  try {
    const product = await createProduct(supabase, { 
      title, 
      price: parseFloat(finalPrice), 
      currency,  
      priceType, 
      userId: serverSession.user.id,
      description,
      condition,
      category,
      location
    });
    
    const allImageUrls = [...letGoBuddyImageUrls];
    
    if (imageFiles.length > 0) {
      const uploadedUrls = await uploadProductImages(supabase, {
        productId: product.product_id,
        userId: serverSession.user.id,
        images: imageFiles,
      });
      allImageUrls.push(...uploadedUrls);
    }
    
    if (allImageUrls.length > 0) {
      await saveProductImages(supabase, {
        productId: product.product_id,
        imageUrls: allImageUrls,
      });
    }
    
    return redirect(`/secondhand/product/${product.product_id}`);
  } catch (err: any) {
    console.error("Error creating product:", err);
    return json({ error: "Failed to create product. Please try again." });
  }
};

export default function SubmitAListingPage() {
  const { categories, locations, letGoBuddyData } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  
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

  const isSubmitting = navigation.state === 'submitting';
  
  useEffect(() => {
    if (letGoBuddyData) {
      setTitle(letGoBuddyData.title || "");
      setPrice(letGoBuddyData.price || "");
      setPriceType(letGoBuddyData.priceType || "Fixed");
      setDescription(letGoBuddyData.description || "");
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
      <Form method="post" encType="multipart/form-data" className="flex flex-col md:flex-row gap-4 md:gap-8 w-full md:max-w-4xl md:mx-auto">
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
             <Select name="priceType" value={priceType} onValueChange={setPriceType}>
                 <SelectTrigger><SelectValue placeholder="Select Price Type" /></SelectTrigger>
                 <SelectContent>
                     {PRICE_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                 </SelectContent>
             </Select>

             <div className="relative">
                <Input name="price" placeholder="Price" value={isFree ? "0" : price} onChange={e => setPrice(e.target.value)} disabled={isFree} />
                <Select name="currency" value={currency} onValueChange={setCurrency} disabled={isFree}>
                    <SelectTrigger className="w-24 absolute right-1 top-1 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
             </div>
            
            <Select name="condition" value={condition} onValueChange={setCondition}>
                 <SelectTrigger><SelectValue placeholder="Select Condition" /></SelectTrigger>
                 <SelectContent>
                     {PRODUCT_CONDITIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                 </SelectContent>
            </Select>

            <Select name="category" value={category} onValueChange={setCategory}>
                 <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                 <SelectContent>
                     {categories.map(c => <SelectItem key={c.category_id} value={c.name}>{c.name}</SelectItem>)}
                 </Content>
            </Select>
            
            <Select name="location" value={location} onValueChange={setLocation}>
                 <SelectTrigger><SelectValue placeholder="Select Location" /></SelectTrigger>
                 <SelectContent>
                     {locations.map(l => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}
                 </SelectContent>
            </Select>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Listing"}
            </Button>
            {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
        </div>
      </Form>
    </div>
  );
}
