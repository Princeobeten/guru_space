import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Booking } from '@/schemas/booking.schema';
import { BookingPDF } from './BookingPDF';

export const BookingPDFDownload = ({
  booking,
  firstName,
  lastName,
  email,
  phone,
}: {
  booking: Booking;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
}) => {
  const document = (
    <BookingPDF
      booking={booking}
      firstName={firstName}
      lastName={lastName}
      email={email}
      phone={phone}
    />
  );

  return (
    <PDFDownloadLink
      document={document}
      fileName={`booking_${booking.bookingId}.pdf`}
      style={{ textDecoration: 'none' }}
    >
      <Button 
        variant='ghost' 
        className='rounded-full ml-1 p-1'
      >
        <Download className="h-4 w-4" />
      </Button>
    </PDFDownloadLink>
  );
};