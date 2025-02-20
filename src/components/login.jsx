import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../firebase";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const usersRef = collection(firestore, "users");
      const q = query(
        usersRef,
        where("username", "==", username),
        where("password", "==", password)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        console.log("Login successful:", userData);
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/managerPage");
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("حدث خطأ في تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-8"
      dir="rtl"
    >
      <div className="max-w-md mx-auto">
        <button
          onClick={handleBack}
          className="mb-6 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-300"
        >
          العودة
        </button>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            تسجيل الدخول
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-gray-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="أدخل كلمة المرور"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-colors duration-300 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "جاري تسجيل الدخول..." : "دخول"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
