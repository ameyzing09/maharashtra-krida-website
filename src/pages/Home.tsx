import React from "react";
import ImageSlider from "../component/ImageSlider";
import useHomepageContent from "../hook/useHomepage";
import { TailSpin } from "react-loader-spinner";
import About from "./About";
import Contact from "./Contact";
import Hero from "../component/Hero";
import LiveRecentWidget from "../component/tournament/LiveRecentWidget";

const Home: React.FC = () => {
  const { content, loading, error } = useHomepageContent();
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <TailSpin color="#a3e635" height={80} width={80} />
      </div>
    );

  if (error) return <div className="text-center">{error}</div>;

  return (
    <div className="w-full">
      <Hero />
      <LiveRecentWidget />
      <ImageSlider sliderImages={content} />
      <About />
      <Contact />
    </div>
  );
};

export default Home;
