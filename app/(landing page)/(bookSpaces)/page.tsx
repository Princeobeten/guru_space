'use client';

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import Footer from '@/app/(landing page)/_components/Footer';
import Navbar from '@/app/(landing page)/_components/Navbar';
import Modal from '@/app/(landing page)/_components/Modal';
import Loader from '@/app/(landing page)/_components/Loader';
import { db } from '../../../lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const BookingPage = () => {
  const [bookingId, setBookingId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bookingPlan, setBookingPlan] = useState('hourly');
  const [duration, setDuration] = useState(1);
  const [space, setSpace] = useState('Co Space 1');
  const [seats, setSeats] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [location, setLocation] = useState('Guru Innovation Hub, Eta Agbo');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    confirmAction: () => { },
    details: {} as Record<string, string | number>,
  });

  useEffect(() => {
    setBookingId(uuidv4());
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [bookingPlan, duration, seats]);

  const calculateTotal = () => {
    const baseRate = 300;
    let total = 0;

    switch (bookingPlan) {
      case 'hourly':
        total = baseRate * duration * seats;
        break;
      case 'daily':
        total = baseRate * 12 * duration * seats;
        break;
      case 'weekly':
        total = baseRate * 12 * 5 * duration * seats;
        break;
      case 'monthly':
        total = baseRate * 12 * 5 * 4 * duration * seats;
        break;
    }

    setTotalAmount(total);
  };

  const checkUserInfo = async () => {
    try {
      const userRef = doc(db, 'users', email);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, { name, phone, email });
      }
    } catch (error) {
      console.error('Error checking user info:', error);
      setModalContent({
        title: 'Error',
        message: 'An error occurred while checking user info. Please try again.',
        confirmAction: () => setIsModalOpen(false),
        details: {},
      });
      setIsModalOpen(true);
    }
  };

  const checkAvailability = async () => {
    setIsLoading(true);
    await checkUserInfo();

    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('space', '==', space),
      where('date', '==', date),
      where('time', '==', time),
      where('location', '==', location)
    );

    const querySnapshot = await getDocs(q);
    const available = querySnapshot.empty;

    if (available) {
      try {
        await addDoc(bookingsRef, {
          bookingId,
          name,
          phone,
          email,
          bookingPlan,
          duration,
          space,
          seats,
          date,
          time,
          location,
          totalAmount,
          status: 'available'
        });
        setIsAvailable(true);
        setModalContent({
          title: 'Available',
          message: 'The space is available!',
          confirmAction: () => setIsModalOpen(false),
          details: {},
        });
      } catch (error) {
        console.error('Error adding available booking:', error);
        setModalContent({
          title: 'Error',
          message: 'An error occurred while checking availability. Please try again.',
          confirmAction: () => setIsModalOpen(false),
          details: {},
        });
      }
    } else {
      setIsAvailable(false);
      setModalContent({
        title: 'Not Available',
        message: 'This space is not available for the selected time. Please choose another option.',
        confirmAction: () => setIsModalOpen(false),
        details: {},
      });
    }
    setIsLoading(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsLoading(true);

    if (isAvailable) {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('space', '==', space),
        where('date', '==', date),
        where('time', '==', time),
        where('location', '==', location),
        where('status', '==', 'available')
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const bookingDoc = querySnapshot.docs[0];
        try {
          await updateDoc(bookingDoc.ref, { status: 'paid' });
          setModalContent({
            title: 'Success',
            message: 'Payment successful! Here is your receipt.',
            confirmAction: () => setIsModalOpen(false),
            details: {
              'Booking ID': bookingId,
              Date: date,
              Time: time,
              Location: location,
              'Total Amount': `NGN ${totalAmount}`,
            },
          });
        } catch (error) {
          console.error('Error updating booking:', error);
          setModalContent({
            title: 'Error',
            message: 'An error occurred while processing payment. Please try again.',
            confirmAction: () => setIsModalOpen(false),
            details: {},
          });
        }
      } else {
        setModalContent({
          title: 'Error',
          message: 'The booking is no longer available.',
          confirmAction: () => setIsModalOpen(false),
          details: {},
        });
      }
    }
    setIsLoading(false);
    setIsModalOpen(true);
  };

  const downloadReceipt = () => {
    const receiptDetails = `
      Booking ID: ${bookingId}
      Name: ${name}
      Phone: ${phone}
      Email: ${email}
      Booking Plan: ${bookingPlan}
      Duration: ${duration}
      Space: ${space}
      Seats: ${seats}
      Date: ${date}
      Time: ${time}
      Location: ${location}
      Total Amount: NGN ${totalAmount}
      Payment Status: Paid
    `;

    const pdfDoc = new jsPDF();
    pdfDoc.text(receiptDetails, 10, 10);
    const pdfBlob = pdfDoc.output('blob');
    const element = document.createElement('a');
    element.href = URL.createObjectURL(pdfBlob);
    element.download = `Receipt_${name}_${bookingId}.pdf`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <>
      <div className="container mx-auto p-4 lg:px-80">
        <h1 className="text-2xl text-navy text-center font-bold mb-4">Book a Space</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Booking ID:</label>
            <input type="text" value={bookingId} readOnly className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Name:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Phone Number:</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Booking Plan:</label>
            <select value={bookingPlan} onChange={(e) => setBookingPlan(e.target.value)} className="w-full p-2 border rounded">
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Duration ({bookingPlan}):</label>
            <input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} min="1" required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Space:</label>
            <select value={space} onChange={(e) => setSpace(e.target.value)} className="w-full p-2 border rounded">
              <option value="Co Space 1">Co Space 1</option>
              <option value="Co Space 2">Co Space 2</option>
              <option value="Co Space 3">Co Space 3</option>
              <option value="Conference Room">Conference Room</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Seats:</label>
            <input
              type="number"
              value={seats}
              onChange={(e) => setSeats(parseInt(e.target.value))}
              min="1"
              max={space === 'Conference Room' ? 8 : 4}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Date:</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Time:</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} min="10:00" max="19:00" required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Location:</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-2 border rounded">
              <option value="Guru Innovation Hub, Eta Agbo">Guru Innovation Hub, Eta Agbo</option>
            </select>
          </div>
          <div>
            <button type="button" onClick={checkAvailability} className="bg-blue-500 text-white p-2 rounded">
              {isLoading ? <Loader /> : 'Check Availability'}
            </button>
          </div>
          {isAvailable !== null && (
            <div className={isAvailable ? "text-green-500" : "text-red-500"}>
              {isAvailable ? "Space is available!" : "Space is not available for the selected time."}
            </div>
          )}
          <div>
            <p>Total Amount: NGN {totalAmount}</p>
          </div>
          <div>
            <button type="submit" disabled={!isAvailable || isLoading} className="bg-green-500 text-white p-2 rounded disabled:bg-gray-400">
              {isLoading ? <Loader /> : 'Book and Pay'}
            </button>
          </div>
        </form>
      </div>
      <Modal
        title={modalContent.title}
        message={modalContent.message}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={modalContent.confirmAction}
        details={{
          ...modalContent.details,
          'Payment Status': 'Paid',
        }}
      >
        {modalContent.title === 'Success' && (
          <button
            onClick={downloadReceipt}
            className="text-right justify-end mt-4 bg-green-500 text-white px-4 py-2 rounded"
          >
            Download Receipt
          </button>
        )}
      </Modal>
      </>
  );
};

export default BookingPage;