import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Booking } from '@/schemas/booking.schema';
import { BookingPDF } from './BookingPDF';

// BookingPDFDownload Component
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
      {/* {({ loading, error }) => {
        if (error) {
          console.error('PDF generation error:', error);
          return (
            <Button 
              disabled 
              variant='ghost' 
              className='rounded-full ml-1 p-1'
              title="Error generating PDF"
            >
              <Download className="h-4 w-4 text-red-500" />
            </Button>
          );
        } */}

        {/* return ( */}
          <Button 
            // disabled={loading} 
            variant='ghost' 
            className='rounded-full ml-1 p-1'
            // title={loading ? "Generating PDF..." : "Download PDF"}
          >
            {/* {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )} */}
            <Download className="h-4 w-4" />
          </Button>
        {/* ); */}
      {/* }} */}
    </PDFDownloadLink>
  );
};