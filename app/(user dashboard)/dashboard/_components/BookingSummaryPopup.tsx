"use cleint";

import React, { useState } from 'react';
import { updateDoc, doc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, CheckCircle } from 'lucide-react';
import { PRICE_PER_SEAT } from '@/lib/constants';
import { PaystackButton } from 'react-paystack';

interface BookingSummaryPopupProps {
  extraTime: number;
  onClose: () => void;
  bookingId: string;
  initialAmount: number;
  duration: number;
  customerEmail: string;
}

const BookingSummaryPopup: React.FC<BookingSummaryPopupProps> = ({
  extraTime,
  onClose,
  bookingId,
  initialAmount,
  duration,
  customerEmail,
}) => {
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [enteredToken, setEnteredToken] = useState("");
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  const extraCost = Math.ceil(extraTime / (1000 * 60 * 60)) * PRICE_PER_SEAT;
  const totalAmount = initialAmount + extraCost;
  // const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  // Paystack Configurations
  const paystackConfig = {
    reference: bookingId,
    email: customerEmail,
    amount: totalAmount * 100, // Paystack expects the amount in kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_live_44df19026d6caa0118ef56ccaeda5196569b93da",
  };

  const handlePaystackSuccess = async () => {
    await completeBooking();
    setPaymentStatus("success");
  };

  const handlePaystackClose = () => {
    alert("Payment process was canceled.");
  };

  const handlePayWithCash = async () => {
    setIsGeneratingToken(true);
    const generatedToken = Math.random().toString(36).substr(2, 8);
    try {
      await setDoc(doc(db, "CashTokens", bookingId), {
        token: generatedToken,
        bookingId,
        totalAmount,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      
      setToken(generatedToken);
      setPaymentStatus("token-generated");
    } catch (error) {
      console.error("Error generating token:", error);
      setPaymentStatus("error");
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleValidateToken = async () => {
    try {
      const tokenRef = doc(db, "CashTokens", bookingId);
      const tokenSnapshot = await getDoc(tokenRef);
    
      if (tokenSnapshot.exists() && tokenSnapshot.data().token === enteredToken) {
        await completeBooking(); 
        setPaymentStatus("success");
        await deleteDoc(tokenRef);
      } else {
        setPaymentStatus("invalid-token");
      }
    } catch (error) {
      console.error("Error validating token:", error);
    }
  };

  const completeBooking = async () => {
    try {
      await updateDoc(doc(db, "Bookings", bookingId), { status: "completed", lastUpdated: new Date() });
      onClose();
    } catch (error) {
      console.error("Error completing booking:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <XCircle className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
        <p className="text-gray-700">Initial Amount: <span className="font-medium">{initialAmount} NGN</span></p>
        <p className="text-gray-700">Extra Cost: <span className="font-medium">{extraCost} NGN</span></p>
        <p className="text-gray-800 font-semibold mt-2">Total Amount: {totalAmount} NGN</p>

        {paymentStatus === "success" && (
          <div className="flex items-center space-x-2 text-green-600 mt-4">
            <CheckCircle className="h-6 w-6" />
            <p>Payment Successful!</p>
          </div>
        )}

        {paymentStatus === "token-generated" && (
          <div className="mt-4">
            <p className="text-gray-700">Please provide the token gotten from the admin to validate cash payment:</p>
            <input
              type="text"
              value={enteredToken}
              onChange={(e) => setEnteredToken(e.target.value)}
              placeholder="Enter Token"
              className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-navy"
            />
            <Button className="mt-2 w-full" onClick={handleValidateToken}>Validate Token</Button>
          </div>
        )}

        {paymentStatus === "invalid-token" && (
          <Alert className="border-red-500 mt-4">
            <AlertDescription>Invalid token. Please try again.</AlertDescription>
          </Alert>
        )}

        {!paymentStatus && (
          <div className="mt-4 flex space-x-2">
            <Button className="w-full" onClick={handlePayWithCash}>Pay with Cash</Button>
            <PaystackButton
              {...paystackConfig}
              text="Pay Now"
              onSuccess={handlePaystackSuccess}
              onClose={handlePaystackClose}
              className="w-full border rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSummaryPopup;