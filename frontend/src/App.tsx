import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPassword from "./pages/ForgotPassword";
import ChatPage from "./pages/ChatPage";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected route */}
          <Route
          path="/chat"
          element={
            <ProtectedRoute>
              {({ signOut }) => <ChatPage signOut={signOut} />}
            </ProtectedRoute>
          }
        />


      </Routes>
    </BrowserRouter>
  );
}
