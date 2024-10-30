"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Booking, mapBookingData } from "@/schemas/booking.schema";
import { motion } from "framer-motion";
import {
  CalendarPlus2,
  CalendarX,
  Clock,
  DollarSign,
  Armchair,
  MapPin,
  LogOut,
  LogIn,
  XCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { BookingSkeleton } from "./_components/BookingSkeleton";
import { StatusBadge } from "../_components/StatusBadge";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import BookingTimer from "./_components/BookingTimer";

// Dynamically import the PDF download component with no SSR
const BookingPDFDownload = dynamic(
  () =>
    import("../_components/BookingDownloadButton").then(
      (mod) => mod.BookingPDFDownload
    ),
  { ssr: false }
);

const UserDashboard = () => {
  const [user, loading] = useAuthState(auth);
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firstName, setFirstName] = useState<string | undefined>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (user) {
      try {
        let userDoc = await getDoc(doc(db, "Users", user.uid));

        if (!userDoc.exists()) {
          const usersRef = collection(db, "Users");
          const q = query(usersRef, where("uid", "==", user.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            userDoc = querySnapshot.docs[0];
          } else {
            console.log("No user document found with uid:", user.uid);
            return;
          }
        }

        const userData = userDoc.data();
        setFirstName(userData?.firstName || "");
        setLastName(userData?.lastName || "");
        setEmail(userData?.email || user.email || "");
        setPhone(userData?.phone || "");
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  };

  const fetchCurrentBooking = async () => {
    if (!user) return;

    const bookingsRef = collection(db, "Bookings");
    const q = query(
      bookingsRef,
      where("userId", "==", user.uid),
      where("status", "in", ["active", "in progress"]),
      orderBy("date", "desc")
      //limit(1)
    );

    try {
      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map((doc) => mapBookingData(doc));
      setCurrentBookings(bookings);
    } catch (error) {
      console.error("Error fetching current bookings:", error);
      setCurrentBookings([]);
    }
  };

  const fetchRecentBookings = async () => {
    if (!user) return;

    const bookingsRef = collection(db, "Bookings");
    const q = query(
      bookingsRef,
      where("userId", "==", user.uid),
      where("status", "in", ["completed", "cancelled"]),
      orderBy("date", "desc"),
      limit(2)
    );

    try {
      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map((doc) => mapBookingData(doc));
      setRecentBookings(bookings);
    } catch (error) {
      console.error("Error fetching recent bookings:", error);
      setRecentBookings([]);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!user) return;

    try {
      setIsCancelling(bookingId);
      const bookingRef = doc(db, "Bookings", bookingId);
      await updateDoc(bookingRef, {
        status: "cancelled",
        cancelledAt: new Date(),
      });

      await Promise.all([fetchCurrentBooking(), fetchRecentBookings()]);
    } catch (error) {
      console.error("Error cancelling booking:", error);
    } finally {
      setIsCancelling(null);
    }
  };

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          await Promise.all([
            fetchCurrentBooking(),
            fetchRecentBookings(),
            fetchUserData(),
          ]);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);



  const BookingCard = ({ booking }: { booking: Booking }) => {
    const isActiveOrInProgress =
      booking.status === "active" || booking.status === "in progress";
      const [isCheckedIn, setIsCheckedIn] = useState(false);

    const handleStatusUpdate = useCallback(async () => {
      await Promise.all([fetchCurrentBooking(), fetchRecentBookings()]);
    }, []);

  const handleCheckInStatusChange = (checkedIn: boolean) => {
    setIsCheckedIn(checkedIn);
  };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
      >
        <div className="flex items-start justify-between mb-4 border-b">
          <h3 className="text-lg font-semibold">{booking.spaceType}</h3>
          <div className="flex items-center gap-2">
            <StatusBadge status={booking.status} />
            <BookingPDFDownload
              booking={booking}
              firstName={firstName}
              lastName={lastName}
              email={email}
              phone={phone}
            />
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-3">

          <div className="flex items-center justify-between text-gray-800">
            <div className="flex items-center gap-1">
            <MapPin className="w-5 h-5 mr-2 text-gray-500" /> <p className="hidden sm:inline-flex md:hidden lg:inline-flex">Location:</p>
            </div>
            
            <span className="bg-blue-100 rounded-full px-2 py-1 text-sm">
              {booking.location}
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-800">
            <div className="flex items-center gap-1">
            <CalendarPlus2 className="w-5 h-5 mr-2 text-gray-500" /><p className="hidden sm:inline-flex md:hidden lg:inline-flex">Start Date:</p>
            </div>
            
            <div>
            <span className="bg-blue-200 rounded-full px-2 py-1 text-sm mr-2">
              {booking.startDate?.seconds
                ? new Date(
                    booking.startDate.seconds * 1000
                  ).toLocaleDateString()
                : "Invalid Start Date"}
            </span>
            <span className="bg-blue-200 rounded-full px-2 py-1 text-sm">
              Start Time: {booking.startTime}
            </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-gray-800">
            <div className="flex items-center gap-1">
            <CalendarX className="w-5 h-5 mr-2 text-gray-500" /><p className="hidden sm:inline-flex md:hidden lg:inline-flex">End Date:</p>
            </div>
            
            <div>
            <span className="bg-blue-200 rounded-full px-2 py-1 text-sm mr-2">
              {booking.endDate?.seconds
                ? new Date(booking.endDate.seconds * 1000).toLocaleDateString()
                : "Invalid End Date"}
            </span>
            <span className="bg-blue-200 rounded-full px-2 py-1 text-sm">
              End Time: {booking.endTime}
            </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-gray-800">
            <div className="flex items-center gap-1">
            <Clock className="w-5 h-5 mr-2 text-gray-500" />
            <p className="hidden sm:inline-flex md:hidden lg:inline-flex">Amout:</p>
            </div>
            
            <span className="bg-orange-100 rounded-full px-2 py-1 text-sm">
              {booking.duration} hours
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-800">
            <div className="flex items-center gap-1">
            <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
            <p className="hidden sm:inline-flex md:hidden lg:inline-flex">Amout:</p>
            </div>
            
            <span className="bg-violet-100 rounded-full px-2 py-1 text-sm">
              NGN{booking.amount}
            </span>
          </div>

          {!booking.bookWholeSpace && (
            <div className="flex items-center justify-between text-gray-800 pb-6">
              <div className="flex items-center gap-1">
                <Armchair className="w-5 h-5 mr-2 text-gray-500" />
                <p className="hidden sm:inline-flex md:hidden lg:inline-flex">Seat:</p>
              </div>
              
              <span className="bg-pink-100 rounded-full px-2 py-1 text-sm">
                {booking.numberOfSeats} seats booked
              </span>
            </div>
          )}

          {booking.bookWholeSpace && (
            <div className="flex items-center justify-between text-gray-800 pb-6">
              <div className="flex items-center gap-1">
                <Armchair className="w-5 h-5 mr-2 text-gray-500" />
                <p className="hidden sm:inline-flex md:hidden lg:inline-flex">Seat:</p>
              </div>
              
              <span className="bg-pink-100 rounded-full px-2 py-1 text-xs lg:text-sm">
                Whole space booked (Capacity: {booking.numberOfSeats} seats)
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-10 flex gap-2 sm:gap-3 justify-center items-end border-t p-2">
            {isActiveOrInProgress && (
              <div className="flex items-end justify-between gap-4">
            <BookingTimer 
              booking={{
                bookingId: booking.bookingId,
                duration: booking.duration,
                amount: booking.amount,
              }} 
              onStatusUpdate={handleStatusUpdate}
              onCheckInStatusChange={handleCheckInStatusChange} 
            />
            <Button
              variant="destructive"
              onClick={() => handleCancelBooking(booking.bookingId)}
              disabled={isCancelling === booking.bookingId || isCheckedIn} 
              className="w-max h-max"
            >
              {isCancelling === booking.bookingId ? (
                <Loader2 className="w-5 h-4 animate-spin" />
              ) : (
                <XCircle className="w-5 h-4" />
              )}
            </Button>
          </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-20 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid gap-8 md:grid-cols-2">
            <BookingSkeleton />
            <BookingSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {`Welcome back, ${firstName} ${lastName}`}
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your space bookings and view your history
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Link
            href="/booking"
            className="inline-flex items-center px-6 py-3 bg-navy rounded-full text-white hover:bg-navy/90 transition-colors"
          >
            <Armchair className="w-5 h-5 mr-2" />
            Book New Space
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Current Booking Section */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-xl font-semibold mb-4">Current Bookings</h2>
            {isLoading ? (
              <div className="space-y-4">
                <BookingSkeleton />
              <BookingSkeleton />
              <BookingSkeleton />
              </div>
            ) : currentBookings.length > 0 ? (
              <div className="space-y-4">
                {currentBookings.map((booking, index) => (
                  <BookingCard key={index} booking={booking} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600 text-xs">No active bookings</p>
                <Link
                  href="/booking"
                  className="mt-4 inline-block p-2 rounded-full bg-blue-100 text-navy hover:bg-blue-50 text-sm"
                >
                  Make your first booking
                </Link>
              </div>
            )}
          </motion.section>

          {/* Recent Bookings Section */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
            <div className="space-y-4">
              {isLoading ? (
                <>
                  <BookingSkeleton />
                  <BookingSkeleton />
                </>
              ) : recentBookings.length > 0 ? (
                recentBookings.map((booking, index) => (
                  <BookingCard key={index} booking={booking} />
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600 text-xs">
                    No booking history found
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;