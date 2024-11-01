import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TermsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  triggerClassName?: string;
  triggerText?: string;
}

const TermsDialog = ({
  isOpen,
  onOpenChange,
  triggerClassName = "text-navy hover:underline",
  triggerText = ""
}: TermsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className={triggerClassName}>
          {triggerText}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <h3 className="font-semibold">1. Introduction</h3>
          <p>Welcome to our service. By using our platform, you agree to these terms...</p>
          
          <h3 className="font-semibold">2. User Responsibilities</h3>
          <p>Users are responsible for maintaining the confidentiality of their account...</p>
          
          <h3 className="font-semibold">3. Privacy Policy</h3>
          <p>We take your privacy seriously. Please refer to our Privacy Policy...</p>
          
          <h3 className="font-semibold">4. Service Usage</h3>
          <p>Our service is provided "as is" and we make no warranties...</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsDialog;