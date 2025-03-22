// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
// });
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), , tailwindcss()],
  // server: {
  //   proxy: {
  //     "/upload": {
  //       target: "http://localhost:5001", // Your backend
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //     "/uploads": {
  //       target: "http://localhost:5001",
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
});
