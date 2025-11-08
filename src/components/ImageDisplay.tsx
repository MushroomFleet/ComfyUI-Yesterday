import React from 'react';
import { ImageOutput } from '../types/comfyui.types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, Images } from 'lucide-react';

interface ImageDisplayProps {
  images: ImageOutput[];
  getImageUrl: (image: ImageOutput) => string;
  onDownload: (image: ImageOutput) => void;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  images, 
  getImageUrl,
  onDownload 
}) => {
  if (images.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Images className="h-5 w-5 text-primary" />
          Generated Images ({images.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div key={index} className="space-y-3 group">
              <div className="relative overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md">
                <img
                  src={getImageUrl(image)}
                  alt={`Generated ${index + 1}`}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {image.filename}
                </p>
                <Button
                  onClick={() => onDownload(image)}
                  size="sm"
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
