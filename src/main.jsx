import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Home from "./components/home.jsx";
import WeddingPage from "./components/weddingPage.jsx";
import ShowVideos from "./components/showVideos.jsx";
import Login from "./components/login.jsx";
import ManagerPage from "./components/managerPage.jsx";
import ShowVideosmanager from "./components/showVideosmanager.jsx";
import UploadImage from "./components/imagesforadmin.jsx";
import ShowImages from "./components/showImages.jsx";
import ShowImahesforadmin from "./components/showImahesforadmin.jsx";

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
    path: "/home",
    element: <Home />,
  },
  {
    path: "/showVideos",
    element: <ShowVideos />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/managerPage",
    element: <ManagerPage />,
  },
  {
    path: "/showVideosmanager",
    element: <ShowVideosmanager />,
  },
  {
    path: "/imagesforadmin",
    element: <UploadImage />,
  },
  {
    path: "/showImages",
    element: <ShowImages />,
  },
  {
    path: "/showImahesforadmin",
    element: <ShowImahesforadmin />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
