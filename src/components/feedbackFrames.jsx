import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight, Clock, Plus, MessageCircle } from "lucide-react";

const FeedbackFrames = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const navigate = useNavigate();
  const db = getFirestore();

  useEffect(() => {
    const feedbackRef = collection(db, "feedback");
    const unsubscribe = onSnapshot(feedbackRef, (snapshot) => {
      const feedbackList = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          likes: doc.data().likes || 0,
        }))
        .filter((feedback) => feedback.publish === "yes");
      setFeedbacks(feedbackList);
    });

    return () => unsubscribe();
  }, [db]);

  const handleLike = async (feedbackId) => {
    try {
      const feedbackRef = doc(db, "feedback", feedbackId);
      const feedbackDoc = await getDoc(feedbackRef);

      if (feedbackDoc.exists()) {
        const currentLikes = feedbackDoc.data().likes || 0;
        await updateDoc(feedbackRef, {
          likes: currentLikes + 1,
        });
      }
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-8"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-full flex justify-between">
            <button
              onClick={() => navigate("/weddingPage")}
              className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              <span className="text-gray-700">العودة</span>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:transform group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate("/feedback")}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-pink-700 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة رأيك</span>
            </button>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <MessageCircle className="w-8 h-8 text-pink-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-pink-700 bg-clip-text text-transparent">
              شو بحكو عنا
            </h1>
          </div>
        </div>

        {/* Feedback Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {feedbacks.length === 0 ? (
            <p className="text-center text-gray-500 col-span-2">
              لا توجد ملاحظات منشورة حتى الآن
            </p>
          ) : (
            feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="group relative transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="bg-white backdrop-blur-lg bg-opacity-80 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                  {/* Gradient Line Accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-pink-600 rounded-t-3xl" />

                  {/* Content */}
                  <div className="mb-6">
                    <p className="text-xl text-gray-800 leading-relaxed">
                      {feedback.feedback}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {feedback.createdAt?.toDate().toLocaleString() ?? ""}
                      </span>
                    </div>

                    {/* Heart Icon with Animation and Counter */}
                    <button
                      onClick={() => handleLike(feedback.id)}
                      className="flex items-center gap-2 relative group cursor-pointer"
                    >
                      <span className="text-sm text-gray-600">
                        {feedback.likes || 0}
                      </span>
                      <div className="relative">
                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-pink-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse" />
                        <Heart className="w-6 h-6 text-pink-500 transform group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackFrames;
