import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const AddReservation = () => {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("");
  const [regon, setRegon] = useState("");
  const [date, setDate] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("في الانتظار");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Get Firestore instance (make sure Firebase is initialized elsewhere)
  const db = getFirestore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const reservationData = {
      customerName,
      regon,
      date,
      phone,
      status,
    };
    try {
      await addDoc(collection(db, "reservations"), reservationData);
      setSuccessMessage("تم حفظ الحجز بنجاح");
      // After 2 seconds, navigate to the reservations page
      setTimeout(() => {
        navigate("/reservation");
      }, 2000);
    } catch (error) {
      console.error("Error adding reservation: ", error);
      setIsSubmitting(false); // Allow retry if there's an error.
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white"
      dir="rtl"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-pink-600 bg-pink-100 hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            <span>رجوع</span>
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          إضافة حجز
        </h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6"
        >
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
          <div className="mb-4">
            <label
              htmlFor="date"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              تاريخ الحجز
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          {/* Phone Number Field */}
          <div className="mb-4">
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
              onChange={(e) => setPhone(e.target.value)}
              placeholder="أدخل رقم الهاتف"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="status"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              حالة الحجز
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="في الانتظار">في الانتظار</option>
              <option value="تم التأكيد">تم التأكيد</option>
              <option value="تم الإلغاء">تم الإلغاء</option>
            </select>
          </div>

          {successMessage && (
            <p className="text-green-500 text-center mb-4">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full inline-flex items-center justify-center px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 ${
              isSubmitting
                ? "bg-pink-400 cursor-not-allowed"
                : "bg-pink-600 hover:bg-pink-700"
            }`}
          >
            <Save className="h-4 w-4 ml-2" />
            حفظ الحجز
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddReservation;
