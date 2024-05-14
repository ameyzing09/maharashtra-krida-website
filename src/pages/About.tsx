import React from "react";

const About: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-6">About MAHARASHTRA KRIDA</h1>
        <p className="text-gray-700 text-lg mb-4">
          Incorporated in 2001, MAHARASHTRA KRIDA aims to promote a sports culture and competition among employees in the ever-growing Corporate and IT sector of Pune.
        </p>
        <p className="text-gray-700 text-lg mb-4">
          Over the past 21 years, we've become a registered vendor for over 200+ Fortune 500 and startup IT companies, as well as businesses in the banking, manufacturing, real estate, and hospitality sectors across Pune and its vicinity.
        </p>
        <p className="text-gray-700 text-lg mb-4">
          Recognizing the potential for sports expansion in Pune and other districts in Maharashtra, we ventured into the development and consultancy of sports infrastructure & facilities, providing end-to-end logistical support from setup to business development planning.
        </p>
        <p className="text-gray-700 text-lg">
          Additionally, we promote social welfare programs focusing on safety, health awareness, road safety, traffic awareness, food waste management, water management, environmental responsibility, and plastic management in the corporate sector.
        </p>
      </div>
    </div>
  );
};

export default About;
