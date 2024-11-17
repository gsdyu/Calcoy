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
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Center image when it loads
  useEffect(() => {
    const image = imageRef.current;
    const container = containerRef.current;
    
    const centerImage = () => {
      if (image && container) {
        const x = (container.offsetWidth - image.offsetWidth) / 2;
        const y = (container.offsetHeight - image.offsetHeight) / 2;
        setPosition({ x, y });
        setImageSize({
          width: image.naturalWidth,
          height: image.naturalHeight
        });
      }
    };

    if (image) {
      if (image.complete) {
        centerImage();
      } else {
        image.addEventListener('load', centerImage);
      }
    }

    return () => {
      if (image) {
        image.removeEventListener('load', centerImage);
      }
    };
  }, [imageUrl]);

  const handleDragStart = (e) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setIsDragging(true);
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y
    });
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;

    setPosition({
      x: newX,
      y: newY
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    // Calculate relative position from the center
    const container = containerRef.current;
    const image = imageRef.current;
    
    if (!container || !image) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.width / 2;
    const containerCenterY = containerRect.height / 2;

    // Calculate the offset from center
    const offsetX = position.x - containerCenterX;
    const offsetY = position.y - containerCenterY;

    // Calculate position as percentages
    const positionData = {
      x: offsetX / containerRect.width,
      y: offsetY / containerRect.height,
      scale: scale
    };

    onSave(positionData);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);

      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging]);

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
            className="absolute select-none touch-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              cursor: isDragging ? 'grabbing' : 'grab',
              touchAction: 'none'
            }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
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
          <div className="absolute inset-0 pointer-events-none" style={{
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
              onValueChange={(value) => setScale(value[0] / 100)}
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
              className={`w-24 rounded-full ${
                darkMode 
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="w-24 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
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