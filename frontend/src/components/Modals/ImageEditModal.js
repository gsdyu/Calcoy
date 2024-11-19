import React, { useRef, useState, useEffect } from 'react';
import Cropper from 'react-cropper';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const styles = `
  .cropper-view-box,
  .cropper-face {
    border-radius: 50%;
  }

  .cropper-view-box {
    box-shadow: 0 0 0 1px #39f;
    outline: 0;
  }

  .cropper-face {
    background-color: inherit !important;
  }

  .cropper-dark .cropper-view-box {
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.75);
  }

  .cropper-modal {
    background: rgba(0, 0, 0, 0.75);
  }
`;

const ImageEditModal = ({ isOpen, onClose, imageUrl, onSave }) => {
  const { darkMode } = useTheme();
  const cropperRef = useRef(null);
  const [scale, setScale] = useState(0); // Start at 0 for the slider

  useEffect(() => {
    // Reset scale when modal opens
    setScale(0);
  }, [isOpen]);

  const handleZoom = (value) => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      // Convert slider value to zoom scale (0.5 to 3)
      const zoomValue = 0.5 + (value[0] / 100) * 2.5;
      cropper.zoomTo(zoomValue);
    }
  };

  const handleSave = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    // Get the cropped canvas
    const croppedCanvas = cropper.getCroppedCanvas({
      width: 256,
      height: 256,
      fillColor: '#fff'
    });

    if (croppedCanvas) {
      try {
        // Convert canvas to blob
        const blob = await new Promise((resolve) => 
          croppedCanvas.toBlob(resolve, 'image/png')
        );

        if (!blob) throw new Error('Failed to create image blob');

        // Create a File object from the blob
        const file = new File([blob], 'profile.png', {
          type: 'image/png'
        });

        // Get cropping and transformation data
        const data = cropper.getData();
        const canvasData = cropper.getCanvasData();
        const imageData = cropper.getImageData();

        // Calculate normalized positions and scale
        const x = data.x / canvasData.width;
        const y = data.y / canvasData.height;
        const scale = imageData.width / canvasData.naturalWidth;

        onSave({
          file,
          x,
          y,
          scale
        });
      } catch (error) {
        console.error('Error processing cropped image:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{styles}</style>
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
            className={`relative w-full h-64 rounded-lg overflow-hidden mb-4 ${
              darkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}
          >
            <Cropper
              ref={cropperRef}
              src={imageUrl || "/api/placeholder/400/400"}
              style={{ height: '100%', width: '100%' }}
              aspectRatio={1}
              guides={true}
              dragMode="move"
              cropBoxMovable={false}
              cropBoxResizable={false}
              toggleDragModeOnDblclick={false}
              viewMode={1}
              minCropBoxHeight={128}
              minCropBoxWidth={128}
              cropBoxShape="circle"
              background={false}
              autoCropArea={1}
              className={darkMode ? 'cropper-dark' : ''}
              checkOrientation={false}
              zoomable={true}
              scalable={true}
              initialAspectRatio={1}
              zoomOnTouch={false}
              zoomOnWheel={false}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Zoom
              </label>
              <Slider
                value={[scale]}
                onValueChange={(value) => {
                  setScale(value[0]);
                  handleZoom(value);
                }}
                min={0}
                max={100}
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
    </>
  );
};

export default ImageEditModal;