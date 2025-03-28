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
import ProfileImages from "./components/profileImages.jsx";
import OldReservations from "./components/oldReservations.jsx";
import Feedback from "./components/feedback.jsx";
import FeedbackList from "./components/feedbackList.jsx";
import FeedbackFrames from "./components/feedbackFrames.jsx";
import WeekBeforeToday from "./components/weekBeforeToday.jsx";
import Uploadvideos from "./components/uploadvideos.jsx";
import VideoGalleryAdmin from "./components/videoGalleryAdmin.jsx";
import VideoGallery from "./components/videoGallery.jsx";

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
  {
    path: "/profileImages",
    element: (
      <ProtectedRoute>
        <ProfileImages />
      </ProtectedRoute>
    ),
  },
  {
    path: "/oldReservations",
    element: (
      <ProtectedRoute>
        <OldReservations />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feedback",
    element: <Feedback />,
  },
  {
    path: "/feedbackList",
    element: (
      <ProtectedRoute>
        <FeedbackList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/weekBeforeToday",
    element: (
      <ProtectedRoute>
        <WeekBeforeToday />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feedbackFrames",
    element: <FeedbackFrames />,
  },
  {
    path: "/uploadvideos",
    element: (
      <ProtectedRoute>
        <Uploadvideos />
      </ProtectedRoute>
    ),
  },
  {
    path: "/videoGalleryAdmin",
    element: (
      <ProtectedRoute>
        <VideoGalleryAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/videoGallery",
    element: <VideoGallery />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
