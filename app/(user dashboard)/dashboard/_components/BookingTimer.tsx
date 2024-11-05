'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { updateDoc, doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BookingSummaryPopup from './BookingSummaryPopup';

interface Booking {
  bookingId: string;
  duration: number;
  amount: number;
  customerEmail: string;
}

interface BookingTimerProps {
  booking: Booking;
  onStatusUpdate: () => void;
  onCheckInStatusChange: (checkedIn: boolean) => void;
}

export const BookingTimer: React.FC<BookingTimerProps> = ({ booking, onStatusUpdate, onCheckInStatusChange }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [extraTime, setExtraTime] = useState(0);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const calculateRemainingTime = useCallback(() => {
    if (startTime) {
      const now = Date.now();
      const endTime = new Date(startTime).getTime() + booking.duration * 60 * 60 * 1000;
      const remaining = endTime - now;

      if (remaining > 0) {
        setTimeRemaining(remaining);
        setExtraTime(0);
      } else {
        setTimeRemaining(0);
        setExtraTime(Math.abs(remaining));
      }
    }
  }, [startTime, booking.duration]);

  useEffect(() => {
    if (!booking.bookingId) return;

    const unsubscribe = onSnapshot(doc(db, 'Bookings', booking.bookingId), (docSnapshot) => {
      const data = docSnapshot.data();
      if (data?.checkInTime) {
        setIsCheckedIn(true);
        onCheckInStatusChange(true);

        let checkInDate: Date | null = null;
        if (data.checkInTime instanceof Timestamp) {
          checkInDate = data.checkInTime.toDate();
        } else if (typeof data.checkInTime === 'number') {
          checkInDate = new Date(data.checkInTime);
        }

        if (checkInDate) {
          setStartTime(checkInDate);
          calculateRemainingTime();
        }
      }
    });

    return () => unsubscribe();
  }, [booking.bookingId, onCheckInStatusChange, calculateRemainingTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
  
    if (isCheckedIn && startTime) {
      timer = setInterval(calculateRemainingTime, 1000);
    }
  
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCheckedIn, startTime, calculateRemainingTime]);
  

  const handleCheckIn = async () => {
    const now = new Date();
    try {
      await updateDoc(doc(db, 'Bookings', booking.bookingId), {
        status: 'in progress',
        checkInTime: now,
        lastUpdated: now,
      });
      setIsCheckedIn(true);
      onCheckInStatusChange(true);
      setStartTime(now);
      onStatusUpdate();
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleCheckOut = () => setShowPopup(true);
  const closePopup = () => {
    setShowPopup(false);
    onStatusUpdate();
  };

  return (
    <div className="space-y-4 w-full">
      {isCheckedIn && (
        <Alert className={timeRemaining === 0 ? 'border text-red-500 border-red-300' : 'border text-blue-500 border-blue-50'}>
          <div className="gap-1 flex justify-between items-center w-full">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              {timeRemaining > 0 ? `Time Remaining: ${formatTime(timeRemaining)}` : `Extra Time: ${formatTime(extraTime)}`}
            </AlertDescription>
          </div>
        </Alert>
      )}
      <div className="flex gap-2">
        <Button className="flex-1" variant="default" onClick={handleCheckIn} disabled={isCheckedIn}>
          <LogIn className="w-5 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline-flex md:hidden lg:inline-flex -ml-2 -mr-1">Check</span>In
        </Button>
        <Button className="flex-1" variant="outline" onClick={handleCheckOut} disabled={!isCheckedIn}>
          <LogOut className="w-5 h-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline-flex md:hidden lg:inline-flex -ml-2 -mr-1">Check</span>Out
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

// export default BookingTimer;
