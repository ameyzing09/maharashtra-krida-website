import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function TopProgressBar() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((k) => k + 1);
    setVisible(true);
    const minTimer = setTimeout(() => {
      setVisible(false);
    }, 450);
    return () => {
      clearTimeout(minTimer);
    };
  }, [location.pathname]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
      <AnimatePresence initial={false}>
        {visible && (
          <motion.div
            key={key}
            initial={{ width: "0%", opacity: 1 }}
            animate={{ width: "80%" }}
            exit={{ width: "100%", opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="h-0.5 bg-lime-500"
          />
        )}
      </AnimatePresence>
    </div>
  );
}


