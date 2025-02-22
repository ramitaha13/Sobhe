import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { ArrowLeft, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";

const ShowAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const db = getFirestore();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "schedule"));
        const appointmentList = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setAppointments(appointmentList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("فشل تحميل البيانات");
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [db]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDelete = async (appointmentId, appointmentData) => {
    if (window.confirm("هل أنت متأكد أنك تريد حذف هذا الموعد؟")) {
      try {
        // Delete from schedule collection
        await deleteDoc(doc(db, "schedule", appointmentId));

        // Find and delete associated notification
        const notificationsRef = collection(db, "notifications");
        const notificationsQuery = query(
          notificationsRef,
          where("customerName", "==", appointmentData.customerName),
          where("date", "==", appointmentData.date)
        );

        const notificationsSnapshot = await getDocs(notificationsQuery);

        // Delete all matching notifications
        const deletePromises = notificationsSnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );

        await Promise.all(deletePromises);

        // Update local state
        setAppointments((prev) =>
          prev.filter((appt) => appt.id !== appointmentId)
        );
      } catch (err) {
        console.error("Error deleting appointment:", err);
        setError("حدث خطأ أثناء حذف الموعد");
      }
    }
  };

  // Filter appointments based on customer name and appointment date
  const filteredAppointments = appointments.filter((appt) => {
    const matchesName = appt.customerName
      ?.toLowerCase()
      .includes(filterName.toLowerCase());
    const matchesDate = filterDate ? appt.date === filterDate : true;
    return matchesName && matchesDate;
  });

  // Export the filtered appointments to an Excel file
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredAppointments);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Appointments");
    XLSX.writeFile(wb, "appointments.xlsx");
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center"
        dir="rtl"
      >
        <p className="text-pink-600 text-xl">جاري التحميل...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center"
        dir="rtl"
      >
        <p className="text-red-600 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white"
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-pink-600 bg-pink-100 hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 mb-6"
        >
          <ArrowLeft className="h-4 w-4 ml-2" />
          <span>رجوع</span>
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          قائمة المواعيد
        </h2>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row sm:space-x-4">
          <input
            type="text"
            placeholder="ابحث باسم الزبون"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="mb-2 sm:mb-0 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="date"
            placeholder="تاريخ الموعد"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            onClick={exportToExcel}
            className="mt-2 sm:mt-0 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            تصدير إلى Excel
          </button>
        </div>

        {/* Display number of rows */}
        <div className="mb-4 text-right">
          <p className="text-gray-700 font-bold">
            عدد الصفوف: {filteredAppointments.length}
          </p>
        </div>

        {filteredAppointments.length === 0 ? (
          <p className="text-center text-gray-600">لا توجد مواعيد متاحة</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-md rounded-lg">
              <thead>
                <tr className="bg-pink-50">
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    اسم الزبون
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المنطقة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ الموعد
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم الهاتف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    حذف
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appt.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appt.regon}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appt.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appt.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(appt.id, appt)}
                        className="text-pink-600 hover:text-pink-900 flex items-center"
                      >
                        <Trash2 className="h-4 w-4 ml-1" />
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowAppointments;
