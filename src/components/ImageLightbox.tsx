"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt, isOpen, onClose }: ImageLightboxProps) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoomed(!zoomed);
            }}
            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          >
            {zoomed ? <ZoomOut className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
          </button>

          <motion.div
            key={zoomed ? "zoomed" : "normal"}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={`max-w-full max-h-full ${zoomed ? "overflow-auto cursor-zoom-out" : "cursor-zoom-in"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className={`rounded-2xl shadow-2xl transition-all duration-300 ${
                zoomed ? "max-w-none w-auto h-auto" : "max-w-full max-h-[85vh] object-contain"
              }`}
              style={zoomed ? { maxWidth: "none", maxHeight: "none" } : {}}
            />
          </motion.div>

          <p className="absolute bottom-4 text-white/60 text-sm">{alt}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to use the lightbox
export function useImageLightbox() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState("");
  const [lightboxAlt, setLightboxAlt] = useState("");

  const openLightbox = (src: string, alt: string = "") => {
    setLightboxSrc(src);
    setLightboxAlt(alt);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  return {
    lightboxOpen,
    lightboxSrc,
    lightboxAlt,
    openLightbox,
    closeLightbox,
    ImageLightboxComponent: (
      <ImageLightbox
        src={lightboxSrc}
        alt={lightboxAlt}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
      />
    ),
  };
}
