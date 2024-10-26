// import React, { useState, useEffect } from 'react';
// import { format, differenceInMinutes, parseISO } from 'date-fns';
// import { usePaystackPayment } from 'react-paystack';
// import { db } from '@/lib/firebase';
// import { updateDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from '@/components/ui/dialog';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Clock, CreditCard, Banknote, Calendar, Timer } from 'lucide-react';
// import { Booking } from '@/schemas/booking.schema';

// interface BookingCheckInOutProps {
//   booking: Booking;
//   onUpdate?: () => void;
// }

// const PRICE_PER_HOUR = 400; // ₦400 per hour

// const BookingCheckInOut = ({ booking, onUpdate }: BookingCheckInOutProps) => {
//   const [timer, setTimer] = useState(0);
//   const [isRunning, setIsRunning] = useState(false);
//   const [showPaymentDialog, setShowPaymentDialog] = useState(false);
//   const [extraHours, setExtraHours] = useState(0);
//   const [extraAmount, setExtraAmount] = useState(0);
//   const [error, setError] = useState('');
//   const [checkInTime, setCheckInTime] = useState<Date | null>(null);
//   const [loading, setLoading] = useState(false);

//   // Updated PayStack configuration with correct types
//   const paystackConfig = {
//     reference: `extra-${booking.bookingId}-${new Date().getTime()}`,
//     email: booking.userId, // Assuming userId is an email - adjust if needed
//     amount: extraAmount * 100, // Convert to kobo
//     publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
//     metadata: {
//       custom_fields: [
//         {
//           display_name: "Booking ID",
//           variable_name: "booking_id",
//           value: booking.bookingId
//         },
//         {
//           display_name: "Payment Type",
//           variable_name: "payment_type",
//           value: "extra_hours"
//         },
//         {
//           display_name: "Extra Hours",
//           variable_name: "extra_hours",
//           value: extraHours.toString()
//         }
//       ]
//     }
//   };

//   const initializePayment = usePaystackPayment(paystackConfig);

//   // Timer logic
//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (isRunning) {
//       interval = setInterval(() => {
//         const now = new Date();
//         const elapsed = differenceInMinutes(now, checkInTime!) || 0;
//         setTimer(elapsed);
//       }, 60000); // Update every minute
//     }
//     return () => clearInterval(interval);
//   }, [isRunning, checkInTime]);

//   // Format time display
//   const formatTimeDisplay = (minutes: number) => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}h ${mins}m`;
//   };

//   const handleCheckIn = async () => {
//     try {
//       setLoading(true);
//       const now = new Date();
//       const bookingRef = doc(db, 'Bookings', booking.bookingId);
      
//       await updateDoc(bookingRef, {
//         status: 'in progress',
//         checkInTime: Timestamp.fromDate(now),
//         lastUpdated: Timestamp.fromDate(now)
//       });

//       setCheckInTime(now);
//       setIsRunning(true);
//       onUpdate?.();
//     } catch (err) {
//       setError('Failed to check in. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCheckOut = async () => {
//     if (!checkInTime) return;
    
//     setLoading(true);
//     const now = new Date();
//     const totalMinutes = differenceInMinutes(now, checkInTime);
//     const bookedMinutes = booking.duration * 60;
//     const extraMinutes = Math.max(0, totalMinutes - bookedMinutes);
    
//     // If more than 10 minutes over, charge for extra hour(s)
//     if (extraMinutes > 10) {
//       const extraHoursCount = Math.ceil(extraMinutes / 60);
//       setExtraHours(extraHoursCount);
//       setExtraAmount(extraHoursCount * PRICE_PER_HOUR);
//       setShowPaymentDialog(true);
//     } else {
//       await completeCheckOut();
//     }
//     setLoading(false);
//   };

//   const completeCheckOut = async (paymentMethod?: 'paystack' | 'cash') => {
//     try {
//       setLoading(true);
//       const now = new Date();
//       const bookingRef = doc(db, 'Bookings', booking.bookingId);
      
//       const updateData = {
//         status: 'completed' as const,
//         checkOutTime: Timestamp.fromDate(now),
//         lastUpdated: Timestamp.fromDate(now),
//         totalTimeSpent: timer,
//         extraHours: extraHours || 0,
//         extraAmount: extraAmount || 0
//       };

//       if (paymentMethod) {
//         updateData.extraPaymentMethod = paymentMethod;
//       }

//       await updateDoc(bookingRef, updateData);
//       setIsRunning(false);
//       setShowPaymentDialog(false);
//       onUpdate?.();
//     } catch (err) {
//       setError('Failed to check out. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePaystackSuccess = () => {
//     completeCheckOut('paystack');
//   };

//   const handleCashPayment = () => {
//     completeCheckOut('cash');
//   };

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle className="flex justify-between items-center">
//           <span>Booking Details</span>
//           <span className={`px-3 py-1 rounded-full text-sm ${
//             booking.status === 'active' ? 'bg-blue-100 text-blue-800' :
//             booking.status === 'in progress' ? 'bg-yellow-100 text-yellow-800' :
//             booking.status === 'completed' ? 'bg-green-100 text-green-800' :
//             'bg-red-100 text-red-800'
//           }`}>
//             {booking.status}
//           </span>
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         {/* Booking Info */}
//         <div className="grid grid-cols-2 gap-4">
//           <div className="space-y-1">
//             <p className="text-sm text-gray-500 flex items-center">
//               <Calendar className="w-4 h-4 mr-2" />
//               Booked Duration
//             </p>
//             <p className="text-lg font-medium">{booking.duration} hours</p>
//           </div>
//           <div className="space-y-1">
//             <p className="text-sm text-gray-500 flex items-center">
//               <Timer className="w-4 h-4 mr-2" />
//               Time Elapsed
//             </p>
//             <p className="text-lg font-medium">{formatTimeDisplay(timer)}</p>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex justify-center space-x-4">
//           {booking.status === 'active' && (
//             <Button
//               onClick={handleCheckIn}
//               disabled={loading}
//               className="bg-green-600 hover:bg-green-700"
//             >
//               {loading ? (
//                 <div className="flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
//                   Checking In...
//                 </div>
//               ) : (
//                 'Check In'
//               )}
//             </Button>
//           )}
//           {booking.status === 'in progress' && (
//             <Button
//               onClick={handleCheckOut}
//               disabled={loading}
//               className="bg-red-600 hover:bg-red-700"
//             >
//               {loading ? (
//                 <div className="flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
//                   Checking Out...
//                 </div>
//               ) : (
//                 'Check Out'
//               )}
//             </Button>
//           )}
//         </div>

//         {/* Error Display */}
//         {error && (
//           <Alert variant="destructive">
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}

//         {/* Payment Dialog */}
//         <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Extra Time Payment Required</DialogTitle>
//               <DialogDescription className="space-y-2">
//                 <p>You have exceeded your booked duration by {extraHours} hour(s).</p>
//                 <p className="font-medium">Additional payment of ₦{extraAmount.toLocaleString()} is required.</p>
//               </DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4 mt-4">
//               <Button
//                 onClick={() => initializePayment({
//                   onSuccess: handlePaystackSuccess,
//                   onClose: () => setShowPaymentDialog(false)
//                 })}
//                 className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700"
//               >
//                 <CreditCard className="w-4 h-4 mr-2" />
//                 Pay Now with PayStack
//               </Button>
//               <Button
//                 onClick={handleCashPayment}
//                 variant="outline"
//                 className="w-full flex items-center justify-center"
//               >
//                 <Banknote className="w-4 h-4 mr-2" />
//                 Pay with Cash
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </CardContent>
//     </Card>
//   );
// };

// export default BookingCheckInOut;