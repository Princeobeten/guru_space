import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { SPACE_CONFIGURATIONS, SpaceType } from '@/constants/spaceConstants';

const AvailableSpaces: React.FC = () => {
  const [bookedSeats, setBookedSeats] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const totalCoworkingSpaces = SPACE_CONFIGURATIONS[SpaceType.COWORKING].totalSpace;

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const bookingsRef = collection(db, 'bookings');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const coworkingQuery = query(
          bookingsRef,
          where('spaceType', '==', 'Co-working'),
          where('date', '==', today)
        );

        const querySnapshot = await getDocs(coworkingQuery);
        const totalSeats = querySnapshot.docs.reduce((sum, doc) => {
          const seatCount = doc.data().seat || 0;
          return sum + seatCount;
        }, 0);

        setBookedSeats(totalSeats);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setBookedSeats(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const availableSpaces = totalCoworkingSpaces - bookedSeats;
  const isAvailable = availableSpaces > 0;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Available Co-working Spaces</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse flex flex-col space-y-2">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {availableSpaces} / {totalCoworkingSpaces}
              </span>
              <Badge 
                variant={isAvailable ? "success" : "destructive"}
                className={`${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} px-2 py-1 text-xs rounded-full`}
              >
                {isAvailable ? 'Available' : 'Full'}
              </Badge>
            </div>
            {!isAvailable && (
              <p className="text-sm text-red-600">
                Co-working space is currently full
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailableSpaces;


/*
To get the the available space read through the Booking collection to get the Seat value of bookings which status is not "active" or "in progress" for that Data and time. 
*/ 