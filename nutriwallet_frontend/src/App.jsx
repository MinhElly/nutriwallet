import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { router } from "./routes/router";

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontSize: "14px" },
        }}
      />
    </ThemeProvider>
  );
}

export default App;