import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const BookAppointmentButton = () => {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("");
  const [regon, setRegon] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Initialize Firestore
  const db = getFirestore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all fields are filled before submitting
    if (!customerName || !regon || !selectedDate || !phone) {
      return;
    }

    setIsSubmitting(true);

    // For display, the DatePicker shows dd/mm/yyyy.
    // Here, we format the date to "yyyy-mm-dd" for saving to Firebase.
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const firebaseDate = `${year}-${month}-${day}`; // "yyyy-mm-dd"

    const appointmentData = {
      customerName,
      regon,
      date: firebaseDate,
      phone,
      createdAt: new Date(),
    };

    try {
      await Promise.all([
        addDoc(collection(db, "schedule"), appointmentData),
        addDoc(collection(db, "notifications"), {
          ...appointmentData,
          type: "appointment",
          read: false,
          message: `موعد جديد: ${customerName} - ${firebaseDate}`,
        }),
      ]);

      setSuccessMessage("تم حفظ الموعد بنجاح");
      setTimeout(() => {
        navigate("/schedule");
      }, 2000);
    } catch (error) {
      console.error("Error saving appointment: ", error);
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Determine if any field is empty
  const isFormIncomplete = !customerName || !regon || !selectedDate || !phone;

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white"
      dir="rtl"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-pink-600 bg-pink-100 hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            <span>رجوع</span>
          </button>
        </div>

        {/* Page Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          تسجيل الموعد
        </h2>

        {/* Appointment Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6"
        >
          {/* Customer Name Field */}
          <div className="mb-4">
            <label
              htmlFor="customerName"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              اسم الزبون
            </label>
            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="أدخل اسم الزبون"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          {/* Region Field */}
          <div className="mb-4">
            <label
              htmlFor="regon"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              المنطقة
            </label>
            <input
              id="regon"
              type="text"
              value={regon}
              onChange={(e) => setRegon(e.target.value)}
              placeholder="أدخل المنطقة"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          {/* Date Field with instruction */}
          <div className="mb-4">
            <label
              htmlFor="date"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              تاريخ الموعد (اكتب التاريخ بالشكل dd/mm/yyyy أو اختر من التقويم)
            </label>
            <DatePicker
              id="date"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/yyyy"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              // Prevent choosing a past date by setting the minimum date to today
              minDate={new Date()}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
            <p className="mt-1 text-xs text-gray-500">
              اكتب التاريخ في هذا الإطار بالشكل dd/mm/yyyy
            </p>
          </div>

          {/* Phone Number Field */}
          <div className="mb-6">
            <label
              htmlFor="phone"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              رقم الهاتف
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                const newValue = e.target.value;
                // Only allow numeric characters
                if (/^\d*$/.test(newValue)) {
                  setPhone(newValue);
                }
              }}
              placeholder="أدخل رقم الهاتف"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              inputMode="numeric"
              required
            />
          </div>

          {successMessage && (
            <p className="text-green-500 text-center mb-4">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isFormIncomplete}
            className={`w-full inline-flex items-center justify-center px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 ${
              isSubmitting || isFormIncomplete
                ? "bg-pink-400 cursor-not-allowed"
                : "bg-pink-600 hover:bg-pink-700"
            }`}
          >
            <Save className="h-4 w-4 ml-2" />
            حفظ الموعد
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointmentButton;
