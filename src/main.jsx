import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import WeddingPage from "./components/weddingPage.jsx";
import Login from "./components/login.jsx";
import ManagerPage from "./components/managerPage.jsx";
import UploadImage from "./components/imagesforadmin.jsx";
import ShowImages from "./components/showImages.jsx";
import ShowImahesforadmin from "./components/showImahesforadmin.jsx";
import Reservation from "./components/reservation.jsx";
import Addreservation from "./components/add-reservation.jsx";
import Editreservation from "./components/edit-reservation.jsx";
import SettingsPage from "./components/settingsPage.jsx";
import BookAppointmentButton from "./components/bookAppointmentButton.jsx";
import ContactCustomer from "./components/contactCustomer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <WeddingPage />,
  },
  {
    path: "*",
    element: <WeddingPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/managerPage",
    element: (
      <ProtectedRoute>
        <ManagerPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/imagesforadmin",
    element: (
      <ProtectedRoute>
        <UploadImage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/showImages",
    element: <ShowImages />,
  },
  {
    path: "/showImahesforadmin",
    element: (
      <ProtectedRoute>
        <ShowImahesforadmin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/reservation",
    element: (
      <ProtectedRoute>
        <Reservation />
      </ProtectedRoute>
    ),
  },
  {
    path: "/add-reservation",
    element: (
      <ProtectedRoute>
        <Addreservation />
      </ProtectedRoute>
    ),
  },
  {
    path: "/edit-reservation/:id",
    element: (
      <ProtectedRoute>
        <Editreservation />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/bookAppointmentButton",
    element: <BookAppointmentButton />,
  },
  {
    path: "/contactCustomer",
    element: (
      <ProtectedRoute>
        <ContactCustomer />
      </ProtectedRoute>
    ),
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
