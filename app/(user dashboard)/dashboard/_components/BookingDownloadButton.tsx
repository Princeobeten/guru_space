import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Booking } from '@/schemas/booking.schema';
import logo from '@/public/guru.jpg';

// PDF styles
const styles = StyleSheet.create({
  userSection: {
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 10,
  },
  userHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 10,
    backgroundColor: '#f7fafc',
    padding: 8,
  },
  userRow: {
    flexDirection: 'row',
    marginVertical: 3,
  },
  userLabel: {
    width: 100,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  userValue: {
    flex: 1,
    fontSize: 10,
    color: '#2d3748',
  },
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    position: 'relative',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#001f3f',
  },
  subheader: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a365d',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  label: {
    width: 120,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  value: {
    flex: 1,
    color: '#2d3748',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginVertical: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 20,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyInfo: {
    flex: 1,
    marginLeft: 20,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#001f3f',
    marginBottom: 5,
  },
  contactInfo: {
    fontSize: 10,
    color: '#4a5568',
    marginBottom: 3,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
  },
  table: {
    display: 'flex',
    width: '100%',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 35,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f7fafc',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  referenceNumber: {
    fontSize: 12,
    color: '#4a5568',
    marginTop: 10,
    textAlign: 'right',
  },
  userDetailsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  userDetailsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 10,
  },
});

// PDF Document Component
const BookingPDF = ({ booking, firstName, lastName, email, phone }: { booking: Booking, firstName: string | undefined | null, lastName: string | undefined | null, email: string | undefined | null, phone: string | undefined | null }) => {

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>GURU INNOVATION HUB - ETTAH AGBOR</Text>
        <Text style={styles.subheader}>Booking Details</Text>
        <Text style={styles.referenceNumber}>Reference: GURU-SP-{booking.bookingId}</Text>
        
        <View style={styles.section}>

          <Text style={styles.userHeader}>Customer Information</Text>

          <View style={styles.userRow}>
            <Text style={styles.userLabel}>Name:</Text>
            <Text style={styles.userValue}>{firstName} {lastName}</Text>
          </View>

          <View style={styles.userRow}>
            <Text style={styles.userLabel}>Email:</Text>
            <Text style={styles.userValue}>{email}</Text>
          </View>

          <View style={styles.userRow}>
            <Text style={styles.userLabel}>Phone:</Text>
            <Text style={styles.userValue}>{phone}</Text>
          </View>

          {/* Booking information table */}
          <View style={styles.table}>
            {/* Customer Details Section */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>Booking Information</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader]}></Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Space Type:</Text>
              <Text style={styles.tableCell}>{booking.spaceType}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Location:</Text>
              <Text style={styles.tableCell}>{booking.location}</Text>
            </View>
            
            {/* Dates and Times Section */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>Dates and Times</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader]}></Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Start Date:</Text>
              <Text style={styles.tableCell}>
                {booking.startDate?.seconds
                  ? new Date(booking.startDate.seconds * 1000).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Start Time:</Text>
              <Text style={styles.tableCell}>{booking.startTime}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>End Date:</Text>
              <Text style={styles.tableCell}>
                {booking.endDate?.seconds
                  ? new Date(booking.endDate.seconds * 1000).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>End Time:</Text>
              <Text style={styles.tableCell}>{booking.endTime}</Text>
            </View>
            
            {/* Booking Details Section */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>Booking Details</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader]}></Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Duration:</Text>
              <Text style={styles.tableCell}>{booking.duration} hours</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Amount:</Text>
              <Text style={styles.tableCell}>NGN{booking.amount}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Seats:</Text>
              <Text style={styles.tableCell}>{booking.numberOfSeats}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Image style={styles.logo} src={logo.src} />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>GURU Innovation Hub</Text>
              <Text style={styles.contactInfo}>guru@guruinnovationhub.com</Text>
              <Text style={styles.contactInfo}>No. 74 Ettah Agbor, Calabar</Text>
              <Text style={styles.contactInfo}>Cross River State</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// BookingPDFDownload Component
export const BookingPDFDownload = ({
  booking,
  firstName,
  lastName,
  email,
  phone,
}: {
  booking: Booking,
  firstName: string | undefined | null,
  lastName: string | undefined | null,
  email: string | undefined | null,
  phone: string | undefined | null,
}) => (
  <PDFDownloadLink
    document={
      <BookingPDF
        booking={booking}
        firstName={firstName}
        lastName={lastName}
        email={email}
        phone={phone}
      />
    }
    fileName={`booking_${booking.bookingId}.pdf`}
  >
    {({ loading }) => (
      <Button disabled={loading} variant='ghost' className='rounded-full ml-1 p-1'>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> 
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
          </>
        )}
      </Button>
    )}
  </PDFDownloadLink>
);
