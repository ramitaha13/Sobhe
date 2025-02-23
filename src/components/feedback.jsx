import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const db = getFirestore();

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!feedback || !name || !email) {
      setErrorMessage("جميع الحقول مطلوبة");
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "feedback"), {
        name,
        email,
        feedback,
        publish: "no",
        createdAt: new Date(),
      });

      // Show success message
      setSuccessMessage("شكراً لك! سيتم نشر ملاحظاتك قريباً");
      setErrorMessage("");

      // Clear the form
      setFeedback("");
      setName("");
      setEmail("");

      // Wait for 2 seconds then navigate
      setTimeout(() => {
        navigate("/feedbackFrames");
      }, 2000);
    } catch (error) {
      setErrorMessage("حدث خطأ أثناء إرسال الملاحظات. حاول مرة أخرى لاحقًا.");
      console.error("Error adding feedback:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-8"
      dir="rtl"
    >
      <div className="flex justify-start items-center mb-4">
        <button
          onClick={() => navigate("/feedbackFrames")}
          className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition"
        >
          العودة
        </button>
      </div>
      <h1 className="text-3xl font-bold text-center mb-8">
        صفحة ملاحظات العملاء
      </h1>
      <form
        onSubmit={handleFeedbackSubmit}
        className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg"
      >
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">اسمك</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">ملاحظاتك</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            rows="4"
            disabled={isSubmitting}
          ></textarea>
        </div>

        <button
          type="submit"
          className={`bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "جاري الإرسال..." : "إرسال"}
        </button>
      </form>
    </div>
  );
};

export default FeedbackPage;
