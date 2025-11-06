import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Catalog from "./pages/Catalog";
import AddSaree from "./pages/AddSaree";
import EditSaree from "./pages/EditSaree";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

const queryClient = new QueryClient();



const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useAuth();
  return isAdmin ? <>{children}</> : <Dashboard />;
};

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  return (
    <Routes>
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="add-saree" element={<AdminRoute><AddSaree /></AdminRoute>} />
            <Route path="edit-saree/:id" element={<AdminRoute><EditSaree /></AdminRoute>} />
            <Route path="customers" element={<Customers />} />
            <Route path="orders" element={<Orders />} />
            <Route path="reports" element={<AdminRoute><Reports /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppProvider>
              <Toaster />
              <Sonner />
              <AppContent />
            </AppProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;