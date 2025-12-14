import { useState } from "react";
import { ChevronLeft, ChevronRight, Grid } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface PropertyGalleryProps {
  images: string[];
  propertyTitle: string;
}

const PropertyGallery = ({ images, propertyTitle }: PropertyGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="relative w-full h-[50vh] md:h-[60vh] bg-muted">
        {/* Main Image */}
        <img
          src={images[currentIndex]}
          alt={`${propertyTitle} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/90 hover:bg-background transition-colors shadow-md"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/90 hover:bg-background transition-colors shadow-md"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </>
        )}

        {/* Image Counter & Show All Button */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <div className="bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium text-foreground">
            {currentIndex + 1} / {images.length}
          </div>
          {images.length > 1 && (
            <button
              onClick={() => setShowAllImages(true)}
              className="bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-background transition-colors flex items-center gap-1.5"
            >
              <Grid className="w-4 h-4" />
              Show all
            </button>
          )}
        </div>

        {/* Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex ? "bg-background" : "bg-background/50"
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* All Images Dialog */}
      <Dialog open={showAllImages} onOpenChange={setShowAllImages}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-semibold mb-4">
            All Photos ({images.length})
          </DialogTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {images.map((image, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setShowAllImages(false);
                }}
                className="aspect-[4/3] overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
              >
                <img
                  src={image}
                  alt={`${propertyTitle} - Image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PropertyGallery;
