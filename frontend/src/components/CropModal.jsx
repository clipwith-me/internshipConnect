// frontend/src/components/CropModal.jsx
import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, Check } from 'lucide-react';

/**
 * 🖼️ Image Crop Modal Component
 *
 * Modern Instagram-style image cropping with:
 * - Zoom controls (1x - 3x)
 * - Drag to reposition
 * - Touch-friendly for mobile
 * - Canvas-based cropping
 * - Maintains Microsoft Design System
 */

const CropModal = ({ image, onClose, onCropComplete, aspectRatio = 1, title = "Crop Image" }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCropChange = useCallback((location) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom) => {
    setZoom(newZoom);
  }, []);

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  /**
   * Create cropped image using Canvas API
   */
  const createCroppedImage = async () => {
    try {
      setProcessing(true);

      const imageElement = await loadImage(image);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx || !croppedAreaPixels) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas size to cropped area
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // Draw cropped image
      ctx.drawImage(
        imageElement,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      // Convert canvas to blob
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas is empty'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          0.95 // High quality
        );
      });
    } catch (error) {
      console.error('Error creating cropped image:', error);
      throw error;
    }
  };

  /**
   * Load image into Image element
   */
  const loadImage = (imageSrc) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Enable CORS
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = imageSrc;
    });
  };

  const handleSave = async () => {
    try {
      const croppedBlob = await createCroppedImage();
      onCropComplete(croppedBlob);
      onClose();
    } catch (error) {
      alert('Failed to crop image. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200">
          <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative flex-1 bg-neutral-900 min-h-[300px] sm:min-h-[400px]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
            objectFit="contain"
            style={{
              containerStyle: {
                backgroundColor: '#18181b', // neutral-900
              },
            }}
          />
        </div>

        {/* Zoom Controls */}
        <div className="p-4 sm:p-6 border-t border-neutral-200">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <ZoomOut className="w-5 h-5 text-neutral-600 flex-shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              style={{
                background: `linear-gradient(to right, #0078D4 0%, #0078D4 ${((zoom - 1) / 2) * 100}%, #e5e5e5 ${((zoom - 1) / 2) * 100}%, #e5e5e5 100%)`
              }}
            />
            <ZoomIn className="w-5 h-5 text-neutral-600 flex-shrink-0" />
          </div>

          <div className="text-center text-sm text-neutral-600 mb-4">
            <p className="hidden sm:block">Drag to reposition • Pinch or scroll to zoom</p>
            <p className="sm:hidden">Pinch to zoom • Drag to move</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={processing}
              className="flex-1 h-12 px-4 sm:px-6 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium disabled:opacity-50 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={processing}
              className="flex-1 h-12 px-4 sm:px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Processing...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span className="hidden sm:inline">Save & Upload</span>
                  <span className="sm:hidden">Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropModal;
