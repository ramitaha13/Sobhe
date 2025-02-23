import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const feedbackRef = collection(db, "feedback");

    const unsubscribe = onSnapshot(feedbackRef, (snapshot) => {
      const feedbackList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeedbacks(feedbackList);
    });

    return () => unsubscribe();
  }, [db]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "هل أنت متأكد أنك تريد حذف هذه الملاحظة؟"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "feedback", id));
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  const togglePublish = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "no" ? "yes" : "no";
      await updateDoc(doc(db, "feedback", id), {
        publish: newStatus,
      });
    } catch (error) {
      console.error("Error updating publish status:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const timestamp = date.toDate();
    return `${String(timestamp.getHours()).padStart(2, "0")}:${String(
      timestamp.getMinutes()
    ).padStart(2, "0")}:${String(timestamp.getSeconds()).padStart(
      2,
      "0"
    )} ,${String(timestamp.getDate()).padStart(2, "0")}/${String(
      timestamp.getMonth() + 1
    ).padStart(2, "0")}/${timestamp.getFullYear()}`;
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-4 sm:p-8"
      dir="rtl"
    >
      <div className="flex justify-start mb-4">
        <button
          onClick={() => navigate("/managerPage")}
          className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition flex items-center gap-2"
        >
          <ArrowRight className="h-5 w-5" />
          العودة
        </button>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
        عرض ملاحظات العملاء
      </h1>

      <div className="max-w-4xl mx-auto">
        {feedbacks.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-lg text-center text-gray-500">
            لا توجد ملاحظات حتى الآن
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block bg-white p-6 rounded-lg shadow-lg">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2">اسم</th>
                    <th className="border p-2">البريد الإلكتروني</th>
                    <th className="border p-2">الملاحظات</th>
                    <th className="border p-2">تاريخ الإنشاء</th>
                    <th className="border p-2">حالة النشر</th>
                    <th className="border p-2">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map((feedback) => (
                    <tr key={feedback.id} className="border-b">
                      <td className="p-2">{feedback.name}</td>
                      <td className="p-2">{feedback.email}</td>
                      <td className="p-2">{feedback.feedback}</td>
                      <td className="p-2">
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {formatDate(feedback.createdAt)}
                        </span>
                      </td>
                      <td className="p-2">
                        {feedback.publish === "yes" ? "منشور" : "غير منشور"}
                      </td>
                      <td className="p-2 flex gap-2">
                        <button
                          onClick={() =>
                            togglePublish(feedback.id, feedback.publish)
                          }
                          className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 transition"
                        >
                          {feedback.publish === "no" ? "نشر" : "إلغاء النشر"}
                        </button>
                        <button
                          onClick={() => handleDelete(feedback.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-white p-4 rounded-lg shadow-lg"
                >
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">الاسم:</span>
                      <span>{feedback.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">البريد الإلكتروني:</span>
                      <span className="text-sm">{feedback.email}</span>
                    </div>
                    <div className="border-t pt-2">
                      <span className="font-semibold block mb-1">
                        الملاحظات:
                      </span>
                      <p className="text-gray-700">{feedback.feedback}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">التاريخ:</span>
                      <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 text-sm">
                        {formatDate(feedback.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">الحالة:</span>
                      <span>
                        {feedback.publish === "yes" ? "منشور" : "غير منشور"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2 border-t">
                    <button
                      onClick={() =>
                        togglePublish(feedback.id, feedback.publish)
                      }
                      className="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition flex-1"
                    >
                      {feedback.publish === "no" ? "نشر" : "إلغاء النشر"}
                    </button>
                    <button
                      onClick={() => handleDelete(feedback.id)}
                      className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition flex-1"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackList;
