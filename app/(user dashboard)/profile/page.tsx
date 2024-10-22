"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { sendPasswordResetEmail, updatePassword } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Save, Undo } from "lucide-react";
import Toaster from "@/components/Toaster";
import { validateUserData } from "@/schemas/user.schema";
import ProfileSkeleton from "./_components/ProfileSkeleton";
import TermsDialog from "../_components/TermsDialog";

const Profile = () => {
  // State declarations
  const [originalData, setOriginalData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showToaster, setShowToaster] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [docId, setDocId] = useState("");

  // Check if form data has changed
  const hasChanges = JSON.stringify(userData) !== JSON.stringify(originalData);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setError("No user logged in");
          return;
        }

        const q = query(
          collection(db, "Users"),
          where("uid", "==", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          setDocId(userDoc.id);
          const data = {
            firstName: userDoc.data().firstName || "",
            lastName: userDoc.data().lastName || "",
            phone: userDoc.data().phone || "",
            email: currentUser.email || "",
          };
          setOriginalData(data);
          setUserData(data);
        }
      } catch (err) {
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowToaster(false);
    setSaving(true);

    // Validate form data
    const validationError = validateUserData(userData);
    if (validationError) {
      setError(validationError);
      setShowToaster(true);
      setSaving(false);
      return;
    }

    try {
      // Update Firestore document
      const userDocRef = doc(db, "Users", docId);
      await updateDoc(userDocRef, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      });

      setSuccess("Profile updated successfully!");
      setShowToaster(true);
      setOriginalData(userData); // Update original data after successful save
    } catch (err) {
      setError("Failed to update profile");
      setShowToaster(true);
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setUserData(originalData);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowToaster(false);
    setSaving(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error("No user logged in");
      }

      await sendPasswordResetEmail(auth, currentUser.email);
      setSuccess("Password reset email sent! Check your inbox.");
      setShowToaster(true);
    } catch (err: any) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("No user found with this email.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        default:
          setError("Failed to send reset email. Please try again.");
      }
      setShowToaster(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen mb-10 py-20 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Profile Information</h2>
            {hasChanges && (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={resetChanges}
                  className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <Undo className="w-4 h-4 mr-1" />
                  Reset
                </button>
              </div>
            )}
          </div>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 ${
                    userData.firstName !== originalData.firstName
                      ? "border-blue-300 bg-blue-50"
                      : ""
                  }`}
                  value={userData.firstName}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 ${
                    userData.lastName !== originalData.lastName
                      ? "border-blue-300 bg-blue-50"
                      : ""
                  }`}
                  value={userData.lastName}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 ${
                  userData.phone !== originalData.phone
                    ? "border-blue-300 bg-blue-50"
                    : ""
                }`}
                value={userData.phone}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, phone: e.target.value }))
                }
                required
                pattern="[0-9]{11}"
                title="Please enter a valid 11-digit phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 bg-gray-100"
                value={userData.email}
                disabled
              />
            </div>

            <button
              type="submit"
              disabled={!hasChanges || saving}
              className={`flex items-center justify-center w-full md:w-auto px-6 py-2 bg-navy text-white rounded-md transition ${
                !hasChanges || saving
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-900"
              }`}
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Password Change Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <Alert>
              <AlertDescription>
                Click the button below to receive a password reset email.
              </AlertDescription>
            </Alert>
            <button
              type="submit"
              disabled={saving}
              className={`w-full md:w-auto px-6 py-2 bg-navy text-white rounded-md transition ${
                saving ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-900"
              }`}
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                "Send Reset Email"
              )}
            </button>
          </form>
        </div>

        {/* Terms and Conditions Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Terms & Conditions</h2>
          </div>
          <Alert>
            <AlertDescription>
              By using our service, you agree to our Terms and Conditions.
              Please review them carefully.
            </AlertDescription>
          </Alert>
          <div className="text-sm text-navy text-center p-2 hover:underline">
          <TermsDialog isOpen={isTermsOpen} onOpenChange={setIsTermsOpen} />
          </div>
        </div>


        <Toaster
          message={error || success}
          type={error ? "error" : "success"}
          isVisible={showToaster}
          onClose={() => setShowToaster(false)}
        />
      </div>
    </div>
  );
};

export default Profile;
