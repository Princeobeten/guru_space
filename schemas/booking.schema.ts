import { Timestamp } from 'firebase/firestore';

export interface Booking {
  totalCapacity?: number;
  date?: any;
  bookingId: string;
  userId: string;
  spaceType: 'Co-working' | 'Conference'; 
  duration: number;
  numberOfSeats?: number; 
  startDate: Timestamp;
  startTime: string;
  endDate: Timestamp;
  endTime: string;
  amount: number;
  status: 'active' | 'in progress' | 'completed' | 'canceled';
  location: string;
  bookWholeSpace: boolean;
}

export type CreateBookingInput = Omit<Booking, 'status' | 'bookingId'>;

// Validation function for booking data
export const validateBookingData = (data: CreateBookingInput): string | null => {
  if (!['Co-working', 'Conference'].includes(data.spaceType)) {
    return 'Invalid space type';
  }
  
  if (data.duration <= 0) {
    return 'Duration must be greater than 0';
  }
  
  if (data.amount <= 0) {
    return 'Amount must be greater than 0';
  }

  if (!(data.startDate instanceof Timestamp) || !(data.endDate instanceof Timestamp)) {
    return 'Invalid date format';
  }

  if (data.endDate.toDate() <= data.startDate.toDate()) {
    return 'End date must be after start date';
  }

  if (!data.startTime || !data.endTime) {
    return 'Start and end time are required';
  }

  if (!data.location || data.location.trim() === '') {
    return 'Location is required';
  }

  if (data.spaceType === 'Co-working' && !data.bookWholeSpace && (!data.numberOfSeats || data.numberOfSeats <= 0)) {
    return 'Number of seats must be greater than 0 for Co-working space';
  }

  return null;
};

// Map Firestore data to Booking object
export const mapBookingData = (doc: any): Booking => {
  const data = doc.data();
  return {
    bookingId: doc.id,
    userId: data.userId,
    spaceType: data.spaceType,
    duration: data.duration,
    numberOfSeats: data.numberOfSeats || 1,
    startDate: data.startDate,
    startTime: data.startTime,
    endDate: data.endDate,
    endTime: data.endTime,
    amount: data.amount,
    status: data.status,
    location: data.location,
    bookWholeSpace: data.bookWholeSpace,
  };
};