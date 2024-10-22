"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
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
} from "lucide-react";
import Link from "next/link";
import { BookingSkeleton } from "./_components/BookingSkeleton";
import { BookingPDFDownload } from "../_components/BookingDownloadButton";
import { StatusBadge } from "../_components/StatusBadge";

const UserDashboard = () => {
  const [user, loading] = useAuthState(auth);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firstName, setFirstName] = useState<string | undefined>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const fetchUserData = async () => {
    if (user) {
      try {
        // First try to find the user document by auth uid
        let userDoc = await getDoc(doc(db, "Users", user.uid));

        if (!userDoc.exists()) {
          // If not found, try to find the user document by querying the uid field
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
        //console.log('Found user data:', userData);

        setFirstName(userData?.firstName || "");
        setLastName(userData?.lastName || "");
        setEmail(userData?.email || user.email || "");
        setPhone(userData?.phone || "");

        // console.log('States updated:', {
        //   firstName: userData.firstName,
        //   lastName: userData.lastName,
        //   email: userData.email || user.email,
        //   phone: userData.phone
        // });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
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

  const fetchCurrentBooking = async () => {
    if (!user) return;

    const bookingsRef = collection(db, "Bookings");
    const q = query(
      bookingsRef,
      where("userId", "==", user.uid),
      where("status", "in", ["active", "in progress"]),
      orderBy("date", "desc"),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      setCurrentBooking(mapBookingData(snapshot.docs[0]));
    } else {
      setCurrentBooking(null);
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
      limit(5)
    );

    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map((doc) => mapBookingData(doc));
    setRecentBookings(bookings);
  };

  const BookingCard = ({ booking }: { booking: Booking }) => {

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">{booking.spaceType}</h3>
          <div className="flex items-center">
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

        <div className="space-y-3">
          <div className="flex items-center text-gray-800">
            <MapPin className="w-5 h-5 mr-2 text-gray-500" />
            <span className="bg-blue-100 rounded-full p-1 text-xs">
              {booking.location}
            </span>
          </div>

          <div className="flex items-center text-gray-800">
            <CalendarPlus2 className="w-5 h-5 mr-2 text-gray-500" />
            <span>
              {booking.startDate?.seconds
                ? new Date(
                    booking.startDate.seconds * 1000
                  ).toLocaleDateString()
                : "Invalid Start Date"}
            </span>
            <span className="ml-2 bg-blue-200 rounded-full p-1 text-xs">
              Start Time: {booking.startTime}
            </span>
          </div>

          <div className="flex items-center text-gray-800">
            <CalendarX className="w-5 h-5 mr-2 text-gray-500" />
            <span>
              {booking.endDate?.seconds
                ? new Date(booking.endDate.seconds * 1000).toLocaleDateString()
                : "Invalid End Date"}
            </span>
            <span className="ml-2 bg-blue-300 rounded-full p-1 text-xs">
              End Time: {booking.endTime}
            </span>
          </div>

          <div className="flex items-center text-gray-800">
            <Clock className="w-5 h-5 mr-2 text-gray-500" />
            <span className="bg-yellow-100 rounded-full p-1 text-xs">
              {booking.duration} hours
            </span>
          </div>

          <div className="flex items-center text-gray-800">
            <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
            <span className="bg-violet-100 rounded-full p-1 text-xs">
              NGN{booking.amount}
            </span>
          </div>

          {!booking.bookWholeSpace && (
            <div className="flex items-center text-gray-800">
              <Armchair className="w-5 h-5 mr-2 text-gray-500" />
              <span className="bg-pink-100 rounded-full p-1 text-xs">
                {booking.numberOfSeats} seats booked
              </span>
            </div>
          )}

          {booking.bookWholeSpace && (
            <div className="flex items-center text-gray-800">
              <Armchair className="w-5 h-5 mr-2 text-gray-500" />
              <span className="bg-pink-100 rounded-full p-1 pl-4 text-xs">
                Whole space booked (Capacity: {booking.numberOfSeats} seats)
              </span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
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
            <h2 className="text-xl font-semibold mb-4">Current Booking</h2>
            {isLoading ? (
              <BookingSkeleton />
            ) : currentBooking ? (
              <BookingCard booking={currentBooking} />
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