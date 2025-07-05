import React, { useEffect, useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Header from "@/components/Header";
import Index from "./pages/Index";
import StemTutorPage from "./pages/StemTutorPage";
import NotFound from "./pages/NotFound";

type UserInfo = {
  name: string;
  email: string;
  picture?: string;
  given_name?: string;
};

const queryClient = new QueryClient();

const AppRoutes: React.FC<{
  user: UserInfo | null;
  onLogout: () => void;
  refreshUser: () => void;
}> = ({ user, onLogout, refreshUser }) => {
  // Optionally, pass refreshUser as a prop to pages where you want to refresh after login
  return (
    <Routes>
      <Route path="/" element={<Index user={user} onLogout={onLogout} refreshUser={refreshUser} />} />
      <Route path="/tutor" element={<StemTutorPage user={user} onLogout={onLogout} refreshUser={refreshUser} />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  const [user, setUser] = useState<UserInfo | null>(null);

  // Used to trigger a user info refresh (from login, logout, or page load)
  const refreshUser = useCallback(() => {
    fetch("http://localhost:5000/auth/userinfo", {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUser(data.authenticated ? data.user : null))
      .catch(() => setUser(null));
  }, []);

  // Fetch user on mount (and when refreshUser changes)
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Handler for logout
  const handleLogout = useCallback(() => {
    setUser(null);
    // Optionally, call refreshUser() if you want to re-fetch session from server
    // refreshUser();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Header user={user} onLogout={handleLogout} />
            <AppRoutes user={user} onLogout={handleLogout} refreshUser={refreshUser} />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;