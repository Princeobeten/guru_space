import { ReactNode } from 'react';

interface ModalProps {
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  details?: Record<string, string | number>;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({title, message, isOpen, onClose, onConfirm, details, children}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="mb-4">{message}</p>
        {details && (
          <div className="mb-4">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex justify-between mb-2">
                <span className="font-semibold">{key}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Close</button>
          {onConfirm && (
            <button onClick={onConfirm} className="bg-blue-500 text-white px-4 py-2 rounded">Confirm</button>
          )}
        </div>
        <div className=' justify-end text-end'>
        {children} 
        </div>
      </div>
    </div>
  );
};

export default Modal;