"use client";

import React, { useState, useEffect } from 'react';
import { Timestamp, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { SPACE_PRICING, WHOLE_SPACE_PRICING } from '@/constants/pricing';
import { spaceService } from '@/services/space-service';
import { SpaceType, SPACE_CONFIGURATIONS } from '@/constants/spaceConstants';
import Toaster from '@/components/Toaster';
import BookForm from './_components/BookForm';
import AvailableSpaces from './_components/AvailableSpaces';
import { CreateBookingInput, validateBookingData } from '@/schemas/booking.schema';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Book = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState('');
  const [availableSpaces, setAvailableSpaces] = useState({
    [SpaceType.COWORKING]: 0,
    [SpaceType.CONFERENCE]: 0,
  });
  const [showToaster, setShowToaster] = useState(false);
  const [toasterMessage, setToasterMessage] = useState('');
  const [toasterType, setToasterType] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState({
    spaceType: SpaceType.COWORKING,
    numberOfSeats: 1,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    duration: 1,
    location: 'Guru Innovation Hub - Ettah Agbor',
    bookWholeSpace: false,
  });

  // Business hours constants
  const BUSINESS_HOURS = {
    START: 10,
    END: 17,
  };

  const initializeAllSpaces = async () => {
    try {
      setLoading(true);
      setError(null);

      for (const spaceType of Object.values(SpaceType)) {
        await spaceService.initializeSpaceStats(spaceType);
      }
      
      // Check space availability
      const allStats = await spaceService.getAllSpacesStats();
      
      // Verify if any space is actually available
      const hasAvailableSpace = Object.values(allStats).some(
        stats => stats.availableSpace > 0
      );

      if (!hasAvailableSpace) {
        setError('No spaces are currently available for booking. Please try again later.');
        return;
      }

      // Set available spaces if we have them
      setAvailableSpaces({
        [SpaceType.COWORKING]: allStats[SpaceType.COWORKING]?.availableSpace || 0,
        [SpaceType.CONFERENCE]: allStats[SpaceType.CONFERENCE]?.availableSpace || 0,
      });

      await fetchCurrentBookings();
      await generateBookingId();
    } catch (error) {
      console.error('Error initializing spaces:', error);
      setError('Unable to check space availability. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // ... [keep all other existing functions the same]

  useEffect(() => {
    initializeAllSpaces();
  }, []);

   // Generate Booking ID
  const generateBookingId = async () => {
    try {
      // Get the current date in YYYYMMDD format
      const now = new Date();
      const dateStr = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0');

      // Get count of bookings for today to generate sequence number
      const bookingsRef = collection(db, 'Bookings');
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const todayEnd = new Date(now.setHours(23, 59, 59, 999));

      const todayBookingsQuery = query(
        bookingsRef,
        where('startDate', '>=', Timestamp.fromDate(todayStart)),
        where('startDate', '<=', Timestamp.fromDate(todayEnd))
      );

      const todayBookings = await getDocs(todayBookingsQuery);
      const sequenceNumber = (todayBookings.size + 1).toString().padStart(3, '0');

      // Generate booking ID in format: BK-YYYYMMDD-XXX
      const newBookingId = `GURU-SP-${dateStr}-${sequenceNumber}`;
      setBookingId(newBookingId);
      
      return newBookingId;
    } catch (error) {
      console.error('Error generating booking ID:', error);
      return null;
    }
  };

  useEffect(() => {
    checkSpaceAvailability();
    fetchCurrentBookings();
    generateBookingId(); 
  }, []);

  useEffect(() => {
    if (formData.startDate && formData.startTime && formData.duration) {
      const result = calculateEndDateTime();
      if (result.isValid) {
        setFormData(prev => ({ 
          ...prev, 
          endDate: result.endDate, 
          endTime: result.endTime 
        }));
      } else {
        showToasterMessage(result.error || 'Invalid date or time selection', 'error');
      }
    }
  }, [formData.startDate, formData.startTime, formData.duration]);

  const validateBusinessHours = (dateTime: Date): boolean => {
    const hours = dateTime.getHours();
    return hours >= BUSINESS_HOURS.START && hours <= BUSINESS_HOURS.END;
  };

  const calculateEndDateTime = () => {
    try {
      if (!formData.startDate || !formData.startTime || !formData.duration) {
        return {
          isValid: false,
          error: 'Please fill in all required fields',
          endDate: '',
          endTime: ''
        };
      }

      // Parse the start date and time
      const [year, month, day] = formData.startDate.split('-').map(Number);
      const [hours, minutes] = formData.startTime.split(':').map(Number);
      
      const startDateTime = new Date(year, month - 1, day, hours, minutes);
      
      // Validate start time is within business hours
      if (!validateBusinessHours(startDateTime)) {
        return {
          isValid: false,
          error: 'Start time must be between 10 AM and 5 PM',
          endDate: '',
          endTime: ''
        };
      }

      // Calculate end date/time
      const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60 * 60 * 1000);
      
      // Validate end time is within business hours
      if (!validateBusinessHours(endDateTime)) {
        return {
          isValid: false,
          error: 'Booking must end by 5 PM',
          endDate: '',
          endTime: ''
        };
      }

      // Format the results
      const endDate = endDateTime.toISOString().split('T')[0];
      const endHours = endDateTime.getHours().toString().padStart(2, '0');
      const endMinutes = endDateTime.getMinutes().toString().padStart(2, '0');
      const endTime = `${endHours}:${endMinutes}`;

      // Validate end date is not before start date
      if (endDateTime <= startDateTime) {
        return {
          isValid: false,
          error: 'End date must be after start date',
          endDate: '',
          endTime: ''
        };
      }

      return {
        isValid: true,
        error: null,
        endDate,
        endTime
      };
    } catch (error) {
      console.error('Error calculating end date/time:', error);
      return {
        isValid: false,
        error: 'Invalid date or time selection',
        endDate: '',
        endTime: ''
      };
    }
  };

  const fetchCurrentBookings = async () => {
    try {
      const currentDate = new Date();
      const bookingsRef = collection(db, 'Bookings');
      const activeBookingsQuery = query(
        bookingsRef,
        where('status', '==', 'active'),
        where('endDate', '>=', Timestamp.fromDate(currentDate))
      );

      const bookingsSnapshot = await getDocs(activeBookingsQuery);
      const activeBookings = bookingsSnapshot.docs.map(doc => doc.data());

      const spaces = {
        [SpaceType.COWORKING]: SPACE_CONFIGURATIONS[SpaceType.COWORKING].totalSpace,
        [SpaceType.CONFERENCE]: SPACE_CONFIGURATIONS[SpaceType.CONFERENCE].totalSpace,
      };

      activeBookings.forEach(booking => {
        if (booking.spaceType === SpaceType.COWORKING && booking.bookWholeSpace) {
          spaces[SpaceType.COWORKING] -= SPACE_CONFIGURATIONS[SpaceType.COWORKING].totalSpace;
        } else if (booking.spaceType === SpaceType.COWORKING) {
          spaces[SpaceType.COWORKING] -= booking.numberOfSeats;
        } else if (booking.spaceType === SpaceType.CONFERENCE) {
          spaces[SpaceType.CONFERENCE] -= 1;
        }
      });

      setAvailableSpaces(spaces);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const checkSpaceAvailability = async () => {
    try {
      const allStats = await spaceService.getAllSpacesStats();
      
      // Convert the stats to actual available space numbers
      const newAvailability = {
        [SpaceType.COWORKING]: allStats[SpaceType.COWORKING]?.availableSpace || 0,
        [SpaceType.CONFERENCE]: allStats[SpaceType.CONFERENCE]?.availableSpace || 0,
      };
      
      setAvailableSpaces(newAvailability);
    } catch (error) {
      console.error('Error checking availability:', error);
      showToasterMessage('Error checking space availability', 'error');
      
      // Set default values in case of error
      setAvailableSpaces({
        [SpaceType.COWORKING]: 0,
        [SpaceType.CONFERENCE]: 0,
      });
    }
  };

  const calculateAmount = (): number => {
    if (formData.bookWholeSpace) {
      return WHOLE_SPACE_PRICING[formData.spaceType].pricePerHour * formData.duration;
    }
    return SPACE_PRICING[formData.spaceType].pricePerHour * formData.numberOfSeats * formData.duration;
  };

  const showToasterMessage = (message: string, type: 'success' | 'error') => {
    setToasterMessage(message);
    setToasterType(type);
    setShowToaster(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate date/time before proceeding
    const dateTimeValidation = calculateEndDateTime();
    if (!dateTimeValidation.isValid) {
      showToasterMessage(dateTimeValidation.error || 'Invalid date/time selection', 'error');
      return;
    }

    const selectedSpaceType = formData.spaceType;
    const requiredSeats = formData.bookWholeSpace 
      ? SPACE_CONFIGURATIONS[selectedSpaceType].totalSpace 
      : formData.numberOfSeats;

    if (availableSpaces[selectedSpaceType] < requiredSeats) {
      showToasterMessage(
        `Not enough space available. Available: ${availableSpaces[selectedSpaceType]}, Required: ${requiredSeats}`, 
        'error'
      );
      return;
    }

    if (!auth.currentUser) {
      showToasterMessage('Please login to book a space', 'error');
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const newBookingId = await generateBookingId();
      
      if (!newBookingId) {
        throw new Error('Failed to generate booking ID');
      }

      const bookingData: CreateBookingInput = {
        bookingId: newBookingId,
        userId: auth.currentUser.uid,
        spaceType: selectedSpaceType,
        numberOfSeats: formData.bookWholeSpace ? SPACE_CONFIGURATIONS[SpaceType.COWORKING].totalSpace : formData.numberOfSeats,
        duration: formData.duration,
        startDate: Timestamp.fromDate(startDateTime),
        endDate: Timestamp.fromDate(new Date(`${formData.endDate}T${formData.endTime}`)),
        amount: calculateAmount(),
        location: formData.location,
        startTime: formData.startTime,
        endTime: formData.endTime,
        bookWholeSpace: formData.bookWholeSpace,
      };

      const validationError = validateBookingData(bookingData);
      if (validationError) {
        showToasterMessage(validationError, 'error');
        return;
      }

      const spaceBooked = await spaceService.bookSpace(
        selectedSpaceType, 
        requiredSeats,
        formData.bookWholeSpace
      );

      if (!spaceBooked) {
        showToasterMessage('Failed to reserve space', 'error');
        return;
      }

      const docRef = await addDoc(collection(db, 'Bookings'), {
        ...bookingData,
        status: 'active',
        totalCapacity: requiredSeats,
        createdAt: Timestamp.now(),
      });

      await checkSpaceAvailability();
      showToasterMessage(`Booking successful! ID: ${newBookingId}`, 'success');
      router.push(`/dashboard?bookingId=${newBookingId}`);
    } catch (error) {
      console.error('Booking error:', error);
      showToasterMessage('Error creating booking', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 my-20 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 my-20 bg-white rounded-lg shadow-lg">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Toaster 
        message={toasterMessage} 
        type={toasterType} 
        isVisible={showToaster} 
        onClose={() => setShowToaster(false)} 
      />

      <div className="max-w-2xl mx-auto p-6 my-20 bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Book a Space</h2>
          <AvailableSpaces availableSpaces={availableSpaces} />
        </div>

        <BookForm
          formData={formData}
          availableSpaces={availableSpaces}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          loading={loading}
          calculateAmount={calculateAmount}
          bookingId={bookingId}
        />
      </div>
    </>
  );
};

export default Book;