import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ArrowLeft, Trash, Download } from "lucide-react";
import * as XLSX from "xlsx";
import * as htmlToImage from "html-to-image";

const OldReservationManagement = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const tableRef = useRef(null);
  const db = getFirestore();

  // Helper function to format date from "YYYY-MM-DD" to "DD/MM/YYYY"
  const formatReservationDate = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // Fetch only reservations whose "date" is less than today's date (YYYY-MM-DD string)
  const fetchOldReservations = async () => {
    try {
      const todayString = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
      const oldReservationsQuery = query(
        collection(db, "reservations"),
        where("date", "<", todayString),
        orderBy("date", "desc")
      );

      const querySnapshot = await getDocs(oldReservationsQuery);
      const reservationsData = [];
      querySnapshot.forEach((docSnapshot) => {
        reservationsData.push({ id: docSnapshot.id, ...docSnapshot.data() });
      });
      setReservations(reservationsData);
    } catch (error) {
      console.error("Error fetching old reservations: ", error);
    }
  };

  useEffect(() => {
    fetchOldReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteReservation = async (reservationId) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الحجز القديم؟")) {
      try {
        await deleteDoc(doc(db, "reservations", reservationId));
        setReservations((prev) =>
          prev.filter((reservation) => reservation.id !== reservationId)
        );
      } catch (error) {
        console.error("Error deleting old reservation: ", error);
      }
    }
  };

  const handleBack = () => {
    navigate("/managerPage");
  };

  // Filter the fetched reservations by name and date
  const filteredReservations = reservations.filter((reservation) => {
    const matchesName = reservation.customerName
      ?.toLowerCase()
      .includes(filterName.toLowerCase());
    const matchesDate = filterDate ? reservation.date === filterDate : true;
    return matchesName && matchesDate;
  });

  // Export filtered data to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredReservations);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "OldReservations");
    XLSX.writeFile(wb, "oldReservations.xlsx");
  };

  // Download table as image
  const downloadTableAsImage = async () => {
    if (tableRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(tableRef.current, {
          quality: 1.0,
          backgroundColor: "white",
        });
        const link = document.createElement("a");
        link.download = "oldReservations-table.png";
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Error generating image:", error);
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white"
      dir="rtl"
    >
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-6">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-pink-600 bg-pink-100 hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            <span>رجوع</span>
          </button>

          {/* Centered Heading */}
          <h2 className="flex-1 text-center text-xl font-semibold text-gray-900">
            قائمة الحجوزات القديمة
          </h2>

          {/* Export Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              تصدير إلى Excel
            </button>
            <button
              onClick={downloadTableAsImage}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 flex items-center"
            >
              <Download className="h-4 w-4 ml-2" />
              تحميل كصورة
            </button>
          </div>
        </div>

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
            placeholder="تاريخ الحجز"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Display reservation count */}
        <div className="mb-4 text-right">
          <p className="text-gray-700 font-bold">
            عدد الحجوزات القديمة: {filteredReservations.length}
          </p>
        </div>

        {/* Reservations Table */}
        <div className="overflow-x-auto">
          {filteredReservations.length === 0 ? (
            <p className="text-center text-gray-600">لا توجد حجوزات قديمة</p>
          ) : (
            <table
              ref={tableRef}
              className="w-full border-collapse bg-white shadow-md rounded-lg"
            >
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
                    حالة الحجز
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    حذف
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reservation.regon}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatReservationDate(reservation.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reservation.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reservation.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleDeleteReservation(reservation.id)}
                        className="text-pink-600 hover:text-pink-900"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default OldReservationManagement;
