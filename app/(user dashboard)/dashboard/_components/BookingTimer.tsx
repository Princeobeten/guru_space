'use client';

import React, { useState, useEffect } from 'react';
import { updateDoc, doc, onSnapshot, Timestamp  } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BookingSummaryPopup from "./BookingSummaryPopup";

interface Booking {
  bookingId: string;
  duration: number;
  amount: number
  customerEmail: string;
}

interface BookingTimerProps {
  booking: Booking;
  onStatusUpdate: () => void;
  onCheckInStatusChange: (checkedIn: boolean) => void;
}

const BookingTimer: React.FC<BookingTimerProps> = ({ booking, onStatusUpdate, onCheckInStatusChange  }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [extraTime, setExtraTime] = useState(0);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [startTime, setStartTime] = useState<Date | number>(0);
  const [showPopup, setShowPopup] = useState(false);


  useEffect(() => {
    if (booking.bookingId) {
      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        doc(db, "Bookings", booking.bookingId),
        (docSnapshot) => {
          const data = docSnapshot.data();
          if (data && data.checkInTime) {
            setIsCheckedIn(true);
            onCheckInStatusChange(true); // Notify parent when checked in
  
            let checkInDate;
  
            // Check the type of checkInTime to handle it correctly
            if (data.checkInTime instanceof Timestamp) {
              checkInDate = data.checkInTime.toDate(); // Firestore Timestamp
            } else if (data.checkInTime instanceof Date) {
              checkInDate = data.checkInTime; // JavaScript Date
            } else if (typeof data.checkInTime === "number") {
              checkInDate = new Date(data.checkInTime); // Milliseconds since epoch
            } else {
              console.error("Unknown checkInTime format:", data.checkInTime);
              return;
            }
  
            setStartTime(checkInDate);
  
            // Calculate remaining time
            const now = new Date();
            const endTime = new Date(checkInDate);
            endTime.setHours(endTime.getHours() + booking.duration);
  
            const remaining = endTime.getTime() - now.getTime();
            setTimeRemaining(Math.max(0, remaining));
  
            // Calculate extra time if past duration
            if (remaining < 0) {
              setExtraTime(Math.abs(remaining));
            }
          }
        }
      );
  
      return () => unsubscribe();
    }
  }, [booking.bookingId, booking.duration]);

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    if (isCheckedIn) {
      timer = setInterval(() => {
        const now = new Date();
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + booking.duration);
        
        const remaining = endTime.getTime() - now.getTime();
        
        if (remaining > 0) {
          setTimeRemaining(remaining);
        } else {
          setTimeRemaining(0);
          setExtraTime(prev => prev + 1000); 
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isCheckedIn, startTime, booking.duration]);

  const handleCheckIn = async () => {
    const now = new Date();
    try {
      await updateDoc(doc(db, "Bookings", booking.bookingId), {
        status: "in progress",
        checkInTime: now,
        lastUpdated: now
      });
      setIsCheckedIn(true);
      onCheckInStatusChange(true); // Notify parent
      setStartTime(now);
      onStatusUpdate();
    } catch (error) {
      console.error("Error checking in:", error);
    }
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleCheckOut = () => {
    setShowPopup(true); 
  };

  const closePopup = () => {
    setShowPopup(false);
    onStatusUpdate();
  };


  return (
    <div className="space-y-4 w-full">
      {isCheckedIn && (
        <Alert className={timeRemaining === 0 ? "border text-red-500 border-red-300" : "border text-blue-500 border-blue-50"}>
          <div className='gap-1 flex justify-between items-center w-full'>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            {timeRemaining > 0 ? (
              <>Time Remaining: {formatTime(timeRemaining)}</>
            ) : (
              <>Extra Time: {formatTime(extraTime)}</>
            )}
          </AlertDescription>
          </div>
        </Alert>
      )}
      
      <div className="flex gap-2">
        <Button
          className="flex-1"
          variant="default"
          onClick={handleCheckIn}
          disabled={isCheckedIn}
        >
          <LogIn className="w-5 h-4 mr-1 sm:mr-2" />
          <p className="hidden sm:inline-flex md:hidden lg:inline-flex -ml-2 -mr-1">Check</p>In
        </Button>
        
        <Button
          className="flex-1"
          variant="outline"
          onClick={handleCheckOut}
          disabled={!isCheckedIn}
        >
          <LogOut className="w-5 h-5 mr-1 sm:mr-2" />
          <p className="hidden sm:inline-flex md:hidden lg:inline-flex -ml-2 -mr-1">Check</p>Out
        </Button>
        {showPopup && (
        <BookingSummaryPopup
          extraTime={extraTime}
          onClose={closePopup}
          bookingId={booking.bookingId}
          initialAmount={booking.amount}
          duration={booking.duration}
          customerEmail={booking.customerEmail}
        />
      )}
      </div>
    </div>
  );
};

export default BookingTimer;