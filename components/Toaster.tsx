import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { CircleCheck, CircleX } from 'lucide-react';

type ToasterProps = {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
};

const Toaster: React.FC<ToasterProps> = ({ message, type, isVisible, onClose }) => {
  const [show, setShow] = useState(isVisible);
  const [width, setWidth] = useState(100);

  useEffect(() => {
    setShow(isVisible);
    if (isVisible) {
      setWidth(100);

      const timer = setInterval(() => {
        setWidth((prev) => prev - 1);
      }, 50); 

      const autoCloseTimer = setTimeout(() => {
        setShow(false);
        onClose();
      }, 3000); 

      return () => {
        clearInterval(timer);
        clearTimeout(autoCloseTimer);
      };
    }
  }, [isVisible, onClose]);

  if (!show) return null;

  return (
    <div
      className={clsx(
        'fixed bottom-20 right-4 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300',
        {
          'bg-navy': type === 'success',
          'bg-red-500': type === 'error',
          'opacity-100': show,
          'opacity-0': !show,
        }
      )}
      style={{ width: '320px' }}
    >
      <div className="flex items-center space-x-3">
        {type === 'success' ? (
          <CircleCheck size={24} className='text-navy' />
        ) : (
          <CircleX size={24} className='text-red-500' />
        )}
        <span className="text-sm font-medium">{message}</span>
      </div>

      <div className="w-full bg-gray-200 h-1 mt-2 rounded">
        <div
          className={clsx({
            'bg-navy': type === 'success',
            'bg-red-600': type === 'error',
          })}
          style={{ width: `${width}%`, height: '100%', transition: 'width 0.05s linear' }}
        ></div>
      </div>
    </div>
  );
};

export default Toaster;