"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, isWithinInterval, set, addHours } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { BookingPageSkeleton } from "./_components/bookingPageSkeleton";
import { Loader2 } from "lucide-react";
import Toaster from "@/components/Toaster";

const PRICE_PER_SEAT = 300;
const WHOLE_SPACE_DISCOUNT = 1000;
const TOTAL_SEATS = 20;
const BUSINESS_HOURS = {
  start: 10, // 10 AM
  end: 17, // 5 PM
};

const bookingSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  startTime: z.string().min(1, "Please select a start time"),
  duration: z.number().min(1).max(8),
  numberOfSeats: z.number().min(1).max(TOTAL_SEATS),
  bookWholeSpace: z.boolean().default(false),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
    slots.push(format(set(new Date(), { hours: hour, minutes: 0 }), "HH:mm"));
  }
  return slots;
};

const calculateEndTime = (startTime: string, duration: number) => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const date = set(new Date(), { hours, minutes });
  return format(addHours(date, duration), "HH:mm");
};

const calculateTotalPrice = (
  duration: number,
  numberOfSeats: number,
  bookWholeSpace: boolean
) => {
  if (bookWholeSpace) {
    return PRICE_PER_SEAT * TOTAL_SEATS * duration - WHOLE_SPACE_DISCOUNT;
  }
  return PRICE_PER_SEAT * numberOfSeats * duration;
};

const PriceCalculator = ({
  duration,
  numberOfSeats,
  bookWholeSpace,
}: {
  duration: number;
  numberOfSeats: number;
  bookWholeSpace: boolean;
}) => {
  const total = calculateTotalPrice(duration, numberOfSeats, bookWholeSpace);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="bg-yellow-100 text-navy text-sm w-max px-2 py-1 rounded-full">
            Duration: {duration} hour(s)
          </p>
          {bookWholeSpace ? (
            <>
              <p className="bg-red-100 text-navy text-sm w-max px-2 py-1 rounded-full">
                Whole Space Booking (20 seats)
              </p>
              <p className="bg-blue-100 text-navy text-sm w-max px-2 py-1 rounded-full">
                Discount Applied: - NGN{WHOLE_SPACE_DISCOUNT}
              </p>
            </>
          ) : (
            <p className="bg-blue-100 text-navy text-sm w-max px-2 py-1 rounded-full">
              Number of Seats: {numberOfSeats}
            </p>
          )}
          <p className="text-lg font-bold">Total: NGN{total}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const BookingPage = () => {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      numberOfSeats: 1,
      duration: 1,
      bookWholeSpace: false,
    },
  });

  const { watch, setValue } = form;
  const bookWholeSpace = watch("bookWholeSpace");
  const selectedDate = watch("date");
  const selectedStartTime = watch("startTime");
  const selectedDuration = watch("duration");
  const selectedSeats = watch("numberOfSeats");

  const [toasterMessage, setToasterMessage] = useState("");
  const [toasterType, setToasterType] = useState<"success" | "error">(
    "success"
  );
  const [showToaster, setShowToaster] = useState(false);

  useEffect(() => {
    if (bookWholeSpace) {
      setValue("numberOfSeats", TOTAL_SEATS);
    }
  }, [bookWholeSpace, setValue]);

  useEffect(() => {
    const fetchExistingBookings = async () => {
      if (selectedDate) {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const bookingsRef = collection(db, "Bookings");
        const q = query(
          bookingsRef,
          where("date", ">=", startOfDay),
          where("date", "<=", endOfDay),
          where("status", "==", "active")
        );

        const snapshot = await getDocs(q);
        setExistingBookings(snapshot.docs.map((doc) => doc.data()));
      }
    };

    fetchExistingBookings();
  }, [selectedDate]);

  const checkAvailability = () => {
    if (
      !selectedDate ||
      !selectedStartTime ||
      !selectedDuration ||
      !selectedSeats
    )
      return true;

    const requestedStartTime = set(selectedDate, {
      hours: parseInt(selectedStartTime.split(":")[0]),
      minutes: parseInt(selectedStartTime.split(":")[1]),
    });

    const requestedEndTime = addHours(requestedStartTime, selectedDuration);

    // Check if requested time is within business hours
    const businessStart = set(selectedDate, {
      hours: BUSINESS_HOURS.start,
      minutes: 0,
    });
    const businessEnd = set(selectedDate, {
      hours: BUSINESS_HOURS.end,
      minutes: 0,
    });

    if (
      !isWithinInterval(requestedStartTime, {
        start: businessStart,
        end: businessEnd,
      }) ||
      !isWithinInterval(requestedEndTime, {
        start: businessStart,
        end: businessEnd,
      })
    ) {
      return false;
    }

    // Check conflicts with existing bookings
    let availableSeats = TOTAL_SEATS;
    for (const booking of existingBookings) {
      const bookingStart = booking.startDate.toDate();
      const bookingEnd = addHours(bookingStart, booking.duration);

      if (
        isWithinInterval(requestedStartTime, {
          start: bookingStart,
          end: bookingEnd,
        }) ||
        isWithinInterval(requestedEndTime, {
          start: bookingStart,
          end: bookingEnd,
        })
      ) {
        if (booking.bookWholeSpace) {
          availableSeats = 0;
        } else {
          availableSeats -= booking.numberOfSeats;
        }
      }
    }

    return bookWholeSpace
      ? availableSeats === TOTAL_SEATS
      : availableSeats >= selectedSeats;
  };

  const handleShowToast = (message: string, type: "success" | "error") => {
    setToasterMessage(message);
    setToasterType(type);
    setShowToaster(true);
  };

  const onSubmit = async (data: BookingFormValues) => {
    if (!user) {
      handleShowToast("Please sign in to make a booking", "error");
      return;
    }

    if (!checkAvailability()) {
      handleShowToast("Selected time slot is not available", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingDate = set(data.date, {
        hours: parseInt(data.startTime.split(":")[0]),
        minutes: parseInt(data.startTime.split(":")[1]),
      });

      const bookingData = {
        userId: user.uid,
        date: bookingDate,
        startDate: bookingDate,
        endDate: addHours(bookingDate, data.duration),
        startTime: data.startTime,
        endTime: calculateEndTime(data.startTime, data.duration),
        duration: data.duration,
        numberOfSeats: data.numberOfSeats,
        bookWholeSpace: data.bookWholeSpace,
        amount: calculateTotalPrice(
          data.duration,
          data.numberOfSeats,
          data.bookWholeSpace
        ),
        status: "active",
        spaceType: data.bookWholeSpace ? "Whole Space" : "Individual Seats",
        location: "Guru Innovation Hub - Ettah Agbor",
      };

      await addDoc(collection(db, "Bookings"), bookingData);
      handleShowToast("Your booking has been confirmed", "success");
      form.reset();
      router.push("/dashboard");
    } catch (error) {
      handleShowToast("Failed to create booking. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BookingPageSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-navy text-2xl font-bold">Book Your Space</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Select Date</FormLabel>
                      <FormControl>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            // Ensure we don't pass null to the form
                            if (date) {
                              field.onChange(date);
                            }
                          }}
                          disabled={(date) => {
                            // Disable weekends and past dates
                            const day = date.getDay();
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today || day === 0 || day === 6;
                          }}
                          className="flex items-center justify-center"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select start time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {generateTimeSlots().map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={8}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bookWholeSpace"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Book Whole Space
                        </FormLabel>
                        <div className="text-sm text-gray-500">
                          Book all 20 seats with NGN7,000 discount
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!bookWholeSpace && (
                  <FormField
                    control={form.control}
                    name="numberOfSeats"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Seats</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={TOTAL_SEATS}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedDate &&
                  selectedStartTime &&
                  selectedDuration &&
                  selectedSeats && (
                    <PriceCalculator
                      duration={selectedDuration}
                      numberOfSeats={selectedSeats}
                      bookWholeSpace={bookWholeSpace}
                    />
                  )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !checkAvailability()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Toaster
        message={toasterMessage}
        type={toasterType}
        isVisible={showToaster}
        onClose={() => setShowToaster(false)}
      />
    </div>
  );
};

export default BookingPage;
