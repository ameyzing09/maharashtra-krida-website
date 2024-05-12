import React, { useState, useEffect } from "react";
import { SliderImage } from "../types";

interface ImageSliderProps {
  sliderImages: SliderImage[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ sliderImages }) => {
  const [current, setCurrent] = useState(0);
  const slideLength = sliderImages.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(current => (current === slideLength - 1 ? 0 : current + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slideLength]);

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
    <section className="relative w-full h-screen overflow-hidden" style={{ height: "calc(100vh - 60px)" }} >
      {sliderImages.map((slideImage, index) => (
        <div
          className={index === current ? "slide active flex justify-center items-center" : "slide hidden"}
          key={index}
          style={{ height: "100%" }}
        >
          {index === current && (
            <div className="relative w-full h-full">
              <img
                src={slideImage.imageUrl}
                alt={slideImage.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black to-transparent opacity-95">
                <h2 className="text-lg md:text-2xl font-bold text-white">
                  {slideImage.title}
                </h2>
                <p className="text-sm md:text-lg text-white">
                  {slideImage.description}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
      <button
        className="absolute top-1/2 left-10 transform -translate-y-1/2 text-white text-3xl z-10"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        &lt;
      </button>
      <button
        className="absolute top-1/2 right-10 transform -translate-y-1/2 text-white text-3xl z-10"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        &gt;
      </button>
    </section>
  );
};

export default ImageSlider;
