import React from "react";
import Highlights from "../component/Highlights";
import About from "./About";
import Contact from "./Contact";
import Hero from "../component/Hero";
import LiveRecentWidget from "../component/tournament/LiveRecentWidget";

const Home: React.FC = () => {
  return (
    <div className="w-full">
      <Hero />
      <LiveRecentWidget />
      <Highlights />
      <About />
      <Contact />
    </div>
  );
};

export default Home;
