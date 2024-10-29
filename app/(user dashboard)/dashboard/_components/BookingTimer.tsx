import React, { useState, useEffect } from 'react';
import { updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BookingTimer = ({ booking, onStatusUpdate }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [extraTime, setExtraTime] = useState(0);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    if (booking.bookingId) {
      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(doc(db, "Bookings", booking.bookingId), (doc) => {
        const data = doc.data();
        if (data.checkInTime) {
          setIsCheckedIn(true);
          setStartTime(data.checkInTime.toDate());
          
          // Calculate remaining time
          const now = new Date();
          const endTime = new Date(data.checkInTime.toDate());
          endTime.setHours(endTime.getHours() + booking.duration);
          
          const remaining = endTime.getTime() - now.getTime();
          setTimeRemaining(Math.max(0, remaining));
          
          // Calculate extra time if past duration
          if (remaining < 0) {
            setExtraTime(Math.abs(remaining));
          }
        }
      });

      return () => unsubscribe();
    }
  }, [booking.bookingId]);

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
          setExtraTime(prev => prev + 1000); // Increment extra time by 1 second
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
      setStartTime(now);
      onStatusUpdate();
    } catch (error) {
      console.error("Error checking in:", error);
    }
  };

  const handleCheckOut = async () => {
    const now = new Date();
    try {
      await updateDoc(doc(db, "Bookings", booking.bookingId), {
        status: "completed",
        checkOutTime: now,
        extraTimeSpent: extraTime,
        lastUpdated: now
      });
      setIsCheckedIn(false);
      onStatusUpdate();
    } catch (error) {
      console.error("Error checking out:", error);
    }
  };

  const formatTime = (ms: number | number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-4 w-full">
      {isCheckedIn && (
        <Alert className={timeRemaining === 0 ? "bg-red-50 w-full flex items-center" : "bg-blue-50 w-full flex items-center"}>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            {timeRemaining > 0 ? (
              <>Time Remaining: {formatTime(timeRemaining)}</>
            ) : (
              <>Extra Time: {formatTime(extraTime)}</>
            )}
          </AlertDescription>
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
      </div>
    </div>
  );
};

export default BookingTimer;