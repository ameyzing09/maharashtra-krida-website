import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SliderImage } from "../types";

interface ImageSliderProps {
  sliderImages: SliderImage[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ sliderImages }) => {
  const [current, setCurrent] = useState(0);
  const slideLength = sliderImages.length;
  const imageRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const lazyImage = entry.target as HTMLImageElement;
            lazyImage.src = lazyImage.dataset.src!;
            observer.unobserve(lazyImage);
          }
        });
      },
      { threshold: 0.1 }
    );
    const currentImageRef = imageRef.current;
    currentImageRef.forEach((image) => observer.observe(image));

    return () => {
      currentImageRef.forEach((image) => observer.unobserve(image));
    };
  });

  const nextSlide = () => {
    setCurrent(current === slideLength - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? slideLength - 1 : current - 1);
  };

  if (!Array.isArray(sliderImages) || sliderImages.length <= 0) {
    return null;
  }

  return (
    <section
      className="relative w-full h-screen overflow-hidden"
      style={{ height: "calc(100vh - 60px)" }}
    >
      <AnimatePresence initial={false}>
      {sliderImages.map((slideImage, index) => (
        <motion.div
          className={
            index === current
              ? "slide active flex justify-center items-center"
              : "slide hidden"
          }
          key={index}
          style={{ height: "100%" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: index === current ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {index === current && (
            <div className="relative w-full h-full">
              <img
                src={slideImage.imageUrl}
                alt={slideImage.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 w-full p-4">
                <div className="glass-panel-subtle p-4 backdrop-blur-md">
                  <motion.h2 className="text-lg md:text-2xl font-bold text-white drop-shadow-sm" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
                    {slideImage.title}
                  </motion.h2>
                  <motion.p className="text-sm md:text-lg text-white drop-shadow-sm" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45, delay: 0.05 }}>
                    {slideImage.description}
                  </motion.p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ))}
      </AnimatePresence>
      <button
        className="glass-button-secondary absolute top-1/2 left-10 transform -translate-y-1/2 text-white text-3xl z-10 w-12 h-12 p-0"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        &lt;
      </button>
      <button
        className="glass-button-secondary absolute top-1/2 right-10 transform -translate-y-1/2 text-white text-3xl z-10 w-12 h-12 p-0"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        &gt;
      </button>
    </section>
  );
};

export default ImageSlider;
