import { doc, getDoc, updateDoc, runTransaction, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SpaceType, SPACE_CONFIGURATIONS } from '@/constants/spaceConstants';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

interface SpaceStats {
  availableSpace: number;
  bookedSpace: number;
  totalSpace: number;
  spaceType: SpaceType;
}

const getDefaultDateRange = () => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
};

export const spaceService = {
  async initializeSpaceStats(spaceType: SpaceType): Promise<void> {
    const spaceRef = doc(db, 'Total Space', spaceType);
    const defaultTotal = SPACE_CONFIGURATIONS[spaceType].totalSpace;

    await setDoc(spaceRef, {
      'Available Space': defaultTotal,
      'Booked Space': 0,
      'Total Space': defaultTotal,
      'Space Type': spaceType
    }, { merge: true });
  },

  async getBookedSeatsForTimeSlot(
    spaceType: SpaceType,
    startDate?: Date | null,
    endDate?: Date | null
  ): Promise<number> {
    // Use default dates if none provided
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const validStartDate = startDate && !isNaN(startDate.getTime()) ? startDate : defaultStart;
    const validEndDate = endDate && !isNaN(endDate.getTime()) ? endDate : defaultEnd;

    const bookingsRef = collection(db, 'Bookings');
    
    try {
      // Query for bookings that overlap with the requested time slot
      const bookingsQuery = query(
        bookingsRef,
        where('spaceType', '==', spaceType),
        where('status', 'in', ['active', 'in-progress']),
        where('startDate', '<=', Timestamp.fromDate(validEndDate))
      );
      
      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      // Calculate total booked seats for overlapping bookings
      let totalBookedSeats = 0;
      
      bookingsSnapshot.docs.forEach(doc => {
        const booking = doc.data();
        const bookingStartDate = booking.startDate.toDate();
        const bookingEndDate = booking.endDate.toDate();
        
        // Check if booking overlaps with requested time slot
        if (bookingEndDate >= validStartDate) {
          const bookedSeats = booking.bookWholeSpace 
            ? SPACE_CONFIGURATIONS[spaceType].totalSpace 
            : booking.numberOfSeats;
            
          totalBookedSeats += bookedSeats;
        }
      });

      return totalBookedSeats;
    } catch (error) {
      console.error('Error fetching booked seats:', error);
      return 0;
    }
  },

  async getAvailableSpace(
    spaceType: SpaceType,
    startDate?: Date | null,
    endDate?: Date | null
  ): Promise<number> {
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const validStartDate = startDate && !isNaN(startDate.getTime()) ? startDate : defaultStart;
    const validEndDate = endDate && !isNaN(endDate.getTime()) ? endDate : defaultEnd;

    try {
      const totalSpace = SPACE_CONFIGURATIONS[spaceType].totalSpace;
      const bookedSeats = await this.getBookedSeatsForTimeSlot(
        spaceType,
        validStartDate,
        validEndDate
      );
      
      return Math.max(0, totalSpace - bookedSeats);
    } catch (error) {
      console.error(`Error calculating available space for ${spaceType}:`, error);
      return 0;
    }
  },

  async checkAvailability(
    spaceType: SpaceType, 
    startDate?: Date | null, 
    endDate?: Date | null,
    requestedSeats: number = 1,
    bookWholeSpace: boolean = false
  ): Promise<boolean> {
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const validStartDate = startDate && !isNaN(startDate.getTime()) ? startDate : defaultStart;
    const validEndDate = endDate && !isNaN(endDate.getTime()) ? endDate : defaultEnd;

    try {
      const availableSpace = await this.getAvailableSpace(spaceType, validStartDate, validEndDate);
      
      if (bookWholeSpace) {
        return availableSpace === SPACE_CONFIGURATIONS[spaceType].totalSpace;
      }
      
      return availableSpace >= requestedSeats;
    } catch (error) {
      console.error(`Error checking availability for ${spaceType}:`, error);
      return false;
    }
  },

  async getAllSpacesStats(
    startDate?: Date | null,
    endDate?: Date | null
  ): Promise<Record<SpaceType, SpaceStats>> {
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const validStartDate = startDate && !isNaN(startDate.getTime()) ? startDate : defaultStart;
    const validEndDate = endDate && !isNaN(endDate.getTime()) ? endDate : defaultEnd;

    const stats: Partial<Record<SpaceType, SpaceStats>> = {};
    
    for (const spaceType of Object.values(SpaceType)) {
      try {
        const totalSpace = SPACE_CONFIGURATIONS[spaceType].totalSpace;
        const bookedSpace = await this.getBookedSeatsForTimeSlot(
          spaceType,
          validStartDate,
          validEndDate
        );
        const availableSpace = totalSpace - bookedSpace;

        stats[spaceType] = {
          availableSpace: Math.max(0, availableSpace),
          bookedSpace,
          totalSpace,
          spaceType,
        };
      } catch (error) {
        console.error(`Error getting stats for ${spaceType}:`, error);
        stats[spaceType] = {
          availableSpace: 0,
          bookedSpace: 0,
          totalSpace: SPACE_CONFIGURATIONS[spaceType].totalSpace,
          spaceType,
        };
      }
    }
    
    return stats as Record<SpaceType, SpaceStats>;
  },

  async getBookedSeatsForToday(spaceType: SpaceType): Promise<number> {
    const bookingsRef = collection(db, 'Bookings');
    const today = new Date(); // Current date
    today.setHours(0, 0, 0, 0); // Set to start of the day
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Set to next day
    
    try {
      const bookingsQuery = query(
        bookingsRef,
        where('spaceType', '==', spaceType),
        where('startDate', '>=', Timestamp.fromDate(today)),
        where('startDate', '<', Timestamp.fromDate(tomorrow)),
        where('status', '==', 'active')
      );
      
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const totalBookedSeats = bookingsSnapshot.docs.reduce((total, doc) => {
        const bookingData = doc.data();
        const bookedSeats = bookingData.bookWholeSpace ? SPACE_CONFIGURATIONS[spaceType].totalSpace : bookingData.numberOfSeats;
        return total + bookedSeats;
      }, 0);

      return totalBookedSeats;
    } catch (error) {
      console.error('Error fetching booked seats for today:', error);
      return 0; // Return 0 if there's an error
    }
  },

  async getSpaceStats(spaceType: SpaceType): Promise<SpaceStats> {
    const spaceRef = doc(db, 'Total Space', spaceType);
    const snapshot = await getDoc(spaceRef);
    const defaultTotal = SPACE_CONFIGURATIONS[spaceType].totalSpace;

    if (!snapshot.exists()) {
      // Initialize the document if it doesn't exist
      await this.initializeSpaceStats(spaceType);
      
      return {
        availableSpace: defaultTotal,
        bookedSpace: 0,
        totalSpace: defaultTotal,
        spaceType,
      };
    }

    return {
      availableSpace: snapshot.data()['Available Space'] || defaultTotal,
      bookedSpace: snapshot.data()['Booked Space'] || 0,
      totalSpace: snapshot.data()['Total Space'] || defaultTotal,
      spaceType,
    };
  },

  async releaseSpace(spaceType: SpaceType, seats: number, wasWholeSpace: boolean): Promise<boolean> {
    const spaceRef = doc(db, 'Total Space', spaceType);
    
    try {
      await runTransaction(db, async (transaction) => {
        const spaceDoc = await transaction.get(spaceRef);
        
        if (!spaceDoc.exists()) {
          throw new Error(`${spaceType} space document does not exist!`);
        }
        
        const currentAvailable = spaceDoc.data()['Available Space'];
        const currentBooked = spaceDoc.data()['Booked Space'];
        const totalSpace = spaceDoc.data()['Total Space'];
        
        const seatsToRelease = wasWholeSpace ? totalSpace : seats;
        
        if (currentBooked < seatsToRelease) {
          throw new Error(`Cannot release more seats than are currently booked for ${spaceType}`);
        }
        
        if (currentAvailable + seatsToRelease > totalSpace) {
          throw new Error(`Cannot release more ${spaceType} space than total capacity`);
        }
        
        transaction.update(spaceRef, {
          'Available Space': currentAvailable + seatsToRelease,
          'Booked Space': currentBooked - seatsToRelease
        });
      });
      
      return true;
    } catch (error) {
      console.error(`Error releasing ${spaceType} space:`, error);
      return false;
    }
  },

  async bookSpace(
    spaceType: SpaceType, 
    seats: number, 
    bookWholeSpace: boolean,
    startDate: Date,
    endDate: Date
  ): Promise<boolean> {
    try {
      // First check if space is available for the requested time slot
      const isAvailable = await this.checkAvailability(
        spaceType,
        startDate,
        endDate,
        seats,
        bookWholeSpace
      );

      if (!isAvailable) {
        throw new Error(
          bookWholeSpace 
            ? `The entire ${spaceType} space is not available for the requested time slot`
            : `Not enough seats available in ${spaceType} for the requested time slot`
        );
      }

      return true;
    } catch (error) {
      console.error(`Error booking ${spaceType} space:`, error);
      return false;
    }
  },
};