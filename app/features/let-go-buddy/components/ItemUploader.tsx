import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '~/common/components/ui/button';
import { useToast } from '~/common/components/ui/use-toast';
import { browserClient } from '~/supa-client';
import type { ItemUploaderProps } from '../types';

export function ItemUploader({ 
  onUpload, 
  maxPhotos = 5, 
  existingPhotos = [] 
}: ItemUploaderProps) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadToStorage = async (file: File): Promise<string | null> => {
    try {
      const client = browserClient;
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `items/${fileName}`;

      console.log('Uploading file to storage:', filePath);
      
      // Upload file to letgobuddy-product bucket
      const { data, error } = await client.storage
        .from('letgobuddy-product')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = client.storage
        .from('letgobuddy-product')
        .getPublicUrl(data.path);

      console.log('Public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('uploadToStorage error:', error);
      return null;
    }
  };

  const processFiles = async (files: FileList) => {
    console.log('Processing files:', files.length);
    if (files.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    if (files.length > remainingSlots) {
      toast({
        title: "Too many files",
        description: `You can only upload ${remainingSlots} more photos.`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    const newPhotos: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file.`,
            variant: "destructive"
          });
          continue;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB.`,
            variant: "destructive"
          });
          continue;
        }

        console.log('Processing file:', file.name);
        const url = await uploadToStorage(file);
        console.log('Upload result for', file.name, ':', url ? 'success' : 'failed');
        if (url) {
          newPhotos.push(url);
        } else {
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive"
          });
        }
      }

      if (newPhotos.length > 0) {
        const updatedPhotos = [...photos, ...newPhotos];
        console.log('Setting photos state:', updatedPhotos);
        setPhotos(updatedPhotos);
        onUpload(updatedPhotos);
        toast({
          title: "Photos uploaded",
          description: `Successfully uploaded ${newPhotos.length} photo(s).`,
        });
      }
    } catch (error) {
      console.error('processFiles error:', error);
      toast({
        title: "Upload error",
        description: "An error occurred while uploading. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File selected:', e.target.files?.length);
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    onUpload(updatedPhotos);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  console.log('ItemUploader render, photos state:', photos);
  
  return (
    <div className="space-y-4">
      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                onError={(e) => console.error('Image load error:', e, 'URL:', photo)}
                onLoad={() => console.log('Image loaded:', photo)}
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {photos.length < maxPhotos && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              {uploading ? (
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {uploading ? 'Uploading photos...' : 'Upload photos of your item'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop or click to select photos ({photos.length}/{maxPhotos})
              </p>
              <p className="text-xs text-gray-400 mt-2">
                JPEG, PNG, WebP • Max 5MB each
              </p>
            </div>

            {!uploading && (
              <Button
                onClick={openFileDialog}
                variant="outline"
                className="mt-4"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Photos
              </Button>
            )}
          </div>
        </div>
      )}

      {photos.length >= maxPhotos && (
        <p className="text-sm text-amber-600 text-center">
          Photo limit reached ({maxPhotos}/{maxPhotos})
        </p>
      )}
    </div>
  );
}