import { useState, useRef, useEffect } from 'react';
import { Move } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ImageCropperProps {
  file: File;
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
}

export default function ImageCropper({ file, onCrop, onCancel }: ImageCropperProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      // Center the image initially
      if (containerRef.current && imageRef.current) {
        const container = containerRef.current.getBoundingClientRect();
        const image = imageRef.current.getBoundingClientRect();
        setPosition({
          x: (container.width - image.width) / 2,
          y: (container.height - image.height) / 2
        });
      }
    };
    return () => URL.revokeObjectURL(img.src);
  }, [file]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = async () => {
    if (!imageRef.current || !containerRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to final crop size (always square)
    canvas.width = 256;
    canvas.height = 256;

    // Get the container and image dimensions
    const container = containerRef.current.getBoundingClientRect();
    const image = imageRef.current.getBoundingClientRect();

    // Calculate crop area
    const cropSize = Math.min(container.width, container.height);
    const cropX = (container.width - cropSize) / 2;
    const cropY = (container.height - cropSize) / 2;

    // Draw the image with transformations
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.drawImage(
      imageRef.current,
      position.x - cropX,
      position.y - cropY,
      image.width,
      image.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    ctx.restore();

    // Convert canvas to file
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], 'avatar.png', { type: 'image/png' });
      onCrop(croppedFile);
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900 p-6 rounded-lg max-w-2xl w-full">
        <h3 className="text-lg font-medium text-white mb-4">Edit Avatar</h3>

        {/* Crop Preview */}
        <div 
          ref={containerRef}
          className="relative h-[300px] w-full overflow-hidden rounded-lg bg-gray-800 mb-4"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Circular Mask */}
          <div className="absolute inset-0 bg-black/75">
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent ring-4 ring-white" />
          </div>

          {/* Image */}
          <img
            ref={imageRef}
            src={URL.createObjectURL(file)}
            alt="Crop preview"
            className="absolute cursor-move select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center',
            }}
            onMouseDown={handleMouseDown}
            draggable={false}
          />

          {/* Drag Indicator */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <Move className="h-6 w-6 text-white/50" />
          </div>
        </div>

        {/* Scale Control */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Zoom
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.01"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleCrop}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
