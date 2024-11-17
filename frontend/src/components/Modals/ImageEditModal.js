import React, { useState, useRef, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ImageEditModal = ({ isOpen, onClose, imageUrl, onSave }) => {
  const { darkMode } = useTheme();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const centerImage = () => {
      if (imageRef.current && containerRef.current) {
        const img = imageRef.current;
        const container = containerRef.current;
        
        setImageSize({
          width: img.naturalWidth,
          height: img.naturalHeight
        });

        // Center the image
        const x = (container.clientWidth - img.width) / 2;
        const y = (container.clientHeight - img.height) / 2;
        setPosition({ x, y });
      }
    };

    if (imageRef.current?.complete) {
      centerImage();
    }
    imageRef.current?.addEventListener('load', centerImage);
    return () => imageRef.current?.removeEventListener('load', centerImage);
  }, []);

  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleDragMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const circleRadius = 64; // Half of the circle width (128px)
    
    // Calculate boundaries
    const scaledWidth = imageSize.width * scale;
    const scaledHeight = imageSize.height * scale;
    
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    // Calculate bounds to keep the image covering the circle
    const minX = containerRect.width / 2 - scaledWidth + circleRadius;
    const maxX = containerRect.width / 2 - circleRadius;
    const minY = containerRect.height / 2 - scaledHeight + circleRadius;
    const maxY = containerRect.height / 2 - circleRadius;

    // Constrain the position
    newX = Math.min(Math.max(newX, minX), maxX);
    newY = Math.min(Math.max(newY, minY), maxY);

    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleZoom = (value) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newScale = value[0] / 100;
    
    // Calculate the center point of the circle
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;

    // Calculate the relative position to the center
    const relativeX = position.x - centerX;
    const relativeY = position.y - centerY;

    // Scale the position from the center
    const scaleFactor = newScale / scale;
    const newX = centerX + (relativeX * scaleFactor);
    const newY = centerY + (relativeY * scaleFactor);

    setScale(newScale);
    setPosition({ x: newX, y: newY });
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, scale, imageSize]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl p-6 w-[480px] relative shadow-lg`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Edit Image
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={`rounded-full ${
              darkMode 
                ? 'hover:bg-gray-800 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div 
          ref={containerRef}
          className={`relative w-full h-64 rounded-lg overflow-hidden mb-4 ${
            darkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}
        >
          {/* Draggable Image Container */}
          <div
            className="absolute origin-center"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleDragStart}
          >
            <img
              ref={imageRef}
              src={imageUrl || "/api/placeholder/400/400"}
              alt="Edit preview"
              className="max-w-none"
              draggable="false"
            />
          </div>

          {/* Overlay with Circle Cutout */}
          <div className="absolute inset-0" style={{
            background: `radial-gradient(circle at center, 
              transparent 64px,
              ${darkMode ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.6)'} 65px
            )`
          }} />
          
          {/* Circle Border */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white pointer-events-none"
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Zoom
            </label>
            <Slider
              value={[scale * 100]}
              onValueChange={handleZoom}
              min={100}
              max={300}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              className={`w-24 ${
                darkMode 
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Cancel
            </Button>
            <Button
              onClick={() => onSave({ scale, position })}
              className="w-24 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditModal;