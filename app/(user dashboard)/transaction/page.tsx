"use client";

import dynamic from 'next/dynamic';
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
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
  Search,
  Download,
  CheckCircle2,
  XCircle,
  History,
} from "lucide-react";
import { BookingPDFDownload } from "../_components/BookingDownloadButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "../_components/StatusBadge";

const TransactionHistory = () => {
  const [user, loading] = useAuthState(auth);
  const [transactions, setTransactions] = useState<Booking[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [transactionStats, setTransactionStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    totalAmount: 0,
  });

  const fetchUserData = async () => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFirstName(userData?.firstName || "");
          setLastName(userData?.lastName || "");
          setEmail(userData?.email || user.email || "");
          setPhone(userData?.phone || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    const bookingsRef = collection(db, "Bookings");
    const q = query(
      bookingsRef,
      where("userId", "==", user.uid),
      where("status", "in", ["completed", "cancelled"]),
      orderBy("date", "desc")
    );

    try {
      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map((doc) => mapBookingData(doc));
      setTransactions(bookings);
      setFilteredTransactions(bookings);
      
      // Calculate transaction statistics
      const stats = bookings.reduce(
        (acc, booking) => {
          acc.total++;
          acc.totalAmount += Number(booking.amount) || 0;
          if (booking.status.toLowerCase() === "completed") acc.completed++;
          if (booking.status.toLowerCase() === "cancelled") acc.cancelled++;
          return acc;
        },
        { total: 0, completed: 0, cancelled: 0, totalAmount: 0 }
      );
      setTransactionStats(stats);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          await Promise.all([fetchTransactions(), fetchUserData()]);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    let filtered = transactions;

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.status.toLowerCase() === statusFilter
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.spaceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, statusFilter, transactions]);

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    bgColor, 
    onClick,
    isActive
  }: { 
    icon: any, 
    label: string, 
    value: number | string,
    bgColor: string,
    onClick?: () => void,
    isActive?: boolean
  }) => (
    <motion.div
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      className={`${bgColor} ${
        onClick ? "cursor-pointer" : ""
      } rounded-lg p-4 shadow-sm ${
        isActive ? "ring-2 ring-navy" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
    </motion.div>
  );

  const TransactionCard = ({ transaction }: { transaction: Booking }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">{transaction.spaceType}</h3>
          <div className="flex items-center gap-4">
            <StatusBadge status={transaction.status} />
            <BookingPDFDownload
              booking={transaction}
              firstName={firstName}
              lastName={lastName}
              email={email}
              phone={phone}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center text-gray-800">
            <MapPin className="w-5 h-5 mr-2 text-gray-500" />
            <span className="bg-blue-100 rounded-full p-1 text-xs">
              {transaction.location}
            </span>
          </div>

          <div className="flex items-center text-gray-800">
            <CalendarPlus2 className="w-5 h-5 mr-2 text-gray-500" />
            <span className="text-sm">
              {transaction.startDate?.seconds
                ? new Date(
                    transaction.startDate.seconds * 1000
                  ).toLocaleDateString()
                : "Invalid Date"}
            </span>
          </div>

          <div className="flex items-center text-gray-800">
            <Clock className="w-5 h-5 mr-2 text-gray-500" />
            <span className="bg-yellow-100 rounded-full p-1 text-xs">
              {transaction.duration} hours
            </span>
          </div>

          <div className="flex items-center text-gray-800">
            <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
            <span className="bg-violet-100 rounded-full p-1 text-xs">
              NGN{transaction.amount}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 bg-gray-200 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Transaction History
          </h1>
          <p className="mt-2 text-gray-600">
            View and download your booking history
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={History}
            label="Total Transactions"
            value={transactionStats.total}
            bgColor="bg-white"
            onClick={() => setStatusFilter("all")}
            isActive={statusFilter === "all"}
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={transactionStats.completed}
            bgColor="bg-white"
            onClick={() => setStatusFilter("completed")}
            isActive={statusFilter === "completed"}
          />
          <StatCard
            icon={XCircle}
            label="Cancelled"
            value={transactionStats.cancelled}
            bgColor="bg-white"
            onClick={() => setStatusFilter("cancelled")}
            isActive={statusFilter === "cancelled"}
          />
          <StatCard
            icon={DollarSign}
            label="Total Amount"
            value={`NGN${transactionStats.totalAmount.toLocaleString()}`}
            bgColor="bg-white"
          />
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by space type or location..."
              className="pl-10 h-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction, index) => (
              <TransactionCard key={index} transaction={transaction} />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;