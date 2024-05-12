import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'pending';
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  let backgroundColor;
  const duration = 3000;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          return oldProgress;
        }
        return Math.min(oldProgress + 1, 100);
      });
    }, duration / 100);

    return () => {
      clearInterval(timer);
    };
  }, [duration]);

  switch (type) {
    case 'success':
      backgroundColor = 'bg-green-500';
      break;
    case 'error':
      backgroundColor = 'bg-red-500';
      break;
    case 'pending':
      backgroundColor = 'bg-yellow-500';
      break;
  }

  return (
    <div
      className={`fixed bottom-5 right-5 rounded-lg ${backgroundColor} w-100`}
    >
      <div className='p-5 text-white'>{message}</div>
      <div className='h-1 bg-white'>
        <div
          className={`h-full ${backgroundColor}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Toast;
