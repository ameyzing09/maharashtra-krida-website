import React from "react";

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-paper dark:bg-brand-charcoal text-brand-charcoal dark:text-gray-200">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Contact Us</h1>
        <div className="text-gray-700 dark:text-gray-300 text-lg mb-4">
          <p><strong>Address:</strong> OM SAI Palace, Narhe, Sinhagad Road, Pune 411 041</p>
          <p><strong>Contact Person:</strong> Ashwin Panhalkar</p>
          <p><strong>Phone:</strong> +91 – 9890 171 195</p>
          <p><strong>Email:</strong> maharashtrakrida@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
