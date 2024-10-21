import React, { useEffect, useState } from 'react';
import { SPACE_CONFIGURATIONS, SpaceType } from '@/constants/spaceConstants';
import { formatPrice } from '@/constants/pricing';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Toast } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

interface BookFormProps {
  formData: {
    spaceType: SpaceType;
    numberOfSeats: number;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    duration: number;
    location: string;
    bookWholeSpace: boolean;
  };
  availableSpaces: Record<SpaceType, number>;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  calculateAmount: () => number;
  bookingId: string;
}

const BookForm: React.FC<BookFormProps> = ({
  formData,
  availableSpaces,
  setFormData,
  handleSubmit,
  loading,
  calculateAmount,
  bookingId,
}) => {
  const [remainingSeats, setRemainingSeats] = useState(SPACE_CONFIGURATIONS[SpaceType.COWORKING].totalSpace);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const { toast } = useToast();
  
  const timeSlots = Array.from({ length: 8 }, (_, i) => {
    const hour = i + 10;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const checkBookedSeatsForTimeSlot = async (date: string, startTime: string, duration: number) => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000);
      
      const querySnapshot = await getDocs(
        query(
          bookingsRef,
          where('spaceType', '==', 'Co-working'),
          where('startDate', '==', date),
          where('startTime', '==', startTime)
        )
      );

      const totalBookedSeats = querySnapshot.docs.reduce((sum, doc) => {
        const seatCount = doc.data().seat || 0;
        return sum + seatCount;
      }, 0);

      return SPACE_CONFIGURATIONS[SpaceType.COWORKING].totalSpace - totalBookedSeats;
    } catch (error) {
      console.error('Error checking booked seats:', error);
      return 0;
    }
  };

  useEffect(() => {
    const fetchBookedSeats = async () => {
      if (formData.startDate && formData.startTime && formData.duration) {
        const availableSeatsCount = await checkBookedSeatsForTimeSlot(
          formData.startDate,
          formData.startTime,
          formData.duration
        );
        setRemainingSeats(Math.max(0, availableSeatsCount));
      }
    };

    fetchBookedSeats();
  }, [formData.startDate, formData.startTime, formData.duration]);

  const handleWholeSpaceCheck = async (checked: boolean) => {
    setCheckingAvailability(true);
    
    try {
      if (checked && formData.startDate && formData.startTime && formData.duration) {
        const availableSeatsCount = await checkBookedSeatsForTimeSlot(
          formData.startDate,
          formData.startTime,
          formData.duration
        );

        if (availableSeatsCount < SPACE_CONFIGURATIONS[SpaceType.COWORKING].totalSpace) {
          toast({
            title: "Space Unavailable",
            description: "The entire space is not available for the selected time slot.",
            variant: "destructive",
          });
          setFormData({ ...formData, bookWholeSpace: false });
          return;
        }
      }
      
      setFormData({ ...formData, bookWholeSpace: checked });
    } catch (error) {
      console.error('Error checking whole space availability:', error);
      toast({
        title: "Error",
        description: "Failed to check space availability. Please try again.",
        variant: "destructive",
      });
      setFormData({ ...formData, bookWholeSpace: false });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const validateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    if (endDateTime <= startDateTime) {
      toast({
        title: "Invalid Time",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    if (endDateTime.getHours() > 17) {
      toast({
        title: "Invalid Time",
        description: "Booking must end by 5 PM",
        variant: "destructive",
      });
      return;
    }

    if (remainingSeats === 0) {
      toast({
        title: "No Availability",
        description: "No seats available for the selected time slot",
        variant: "destructive",
      });
      return;
    }

    if (!formData.bookWholeSpace && formData.numberOfSeats > remainingSeats) {
      toast({
        title: "Invalid Selection",
        description: `Only ${remainingSeats} seats available for the selected time slot`,
        variant: "destructive",
      });
      return;
    }

    handleSubmit(e);
  };

  const seatsOptions = Array.from({ length: remainingSeats }, (_, i) => i + 1);


  return (
    <form onSubmit={validateForm} className="space-y-6">
      {/* Booking ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Booking ID</label>
        <input
          type="text"
          value={bookingId}
          readOnly
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
        />
      </div>
      
      {/* Space Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Space Type</label>
        <input
          type="text"
          value="Co-working Space"
          readOnly
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
        />
      </div>

     {/* Book Whole Space Checkbox */}
    <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.bookWholeSpace}
          onChange={(e) => handleWholeSpaceCheck(e.target.checked)}
          disabled={checkingAvailability}
          className="h-4 w-4 text-navy border-gray-300 rounded focus:ring-navy disabled:opacity-50"
        />
        <label className="ml-2 block text-sm text-gray-700">
          Book Entire Space (NGN 7000/hour)
          {checkingAvailability && (
            <span className="ml-2 inline-block animate-spin">⌛</span>
          )}
        </label>
      </div>

      {/* Number of Seats */}
      {!formData.bookWholeSpace && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Number of Seats</label>
          <select
            value={formData.numberOfSeats}
            onChange={(e) => setFormData({ ...formData, numberOfSeats: parseInt(e.target.value) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-navy focus:border-navy"
            required
            disabled={remainingSeats === 0}
          >
            <option value="">Select number of seats</option>
            {seatsOptions.map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'seat' : 'seats'}
              </option>
            ))}
          </select>
          {remainingSeats === 0 && (
            <p className="mt-1 text-sm text-red-600">
              No seats available for the selected time slot
            </p>
          )}
        </div>
      )}

      {/* Start Date, Time, and Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-navy focus:border-navy"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Start Time</label>
          <select
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-navy focus:border-navy"
            required
          >
            <option value="">Select time</option>
            {timeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="text"
            value={formData.endDate}
            readOnly
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700">End Time</label>
          <input
            type="text"
            value={formData.endTime}
            readOnly
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Duration (hours)</label>
        <input
          type="number"
          min="1"
          max="7"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-navy focus:border-navy"
          required
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          value="Guru Innovation Hub- Ettah Agbor"
          readOnly
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
        />
      </div>

      {/* Total Amount Display */}
      <div className="bg-blue-100 p-4 rounded-md">
        <h3 className="text-lg font-semibold text-navy">Total Amount: {formatPrice(calculateAmount())}</h3>
      </div>

       {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || remainingSeats === 0 || checkingAvailability}
        className={`w-full bg-navy text-white py-2 px-4 rounded-md hover:bg-blue-900 transition-colors
          ${(loading || remainingSeats === 0 || checkingAvailability) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Processing...' : checkingAvailability ? 'Checking availability...' : 'Book Now'}
      </button>
    </form>
  );
};

export default BookForm;

