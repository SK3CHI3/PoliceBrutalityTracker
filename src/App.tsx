
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PerformanceOptimizations from "./components/PerformanceOptimizations";
import SEOAnalytics from "./components/SEOAnalytics";
import LazyWrapper, { LazyAdminDashboard } from "./components/LazyWrapper";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import AllNewsPage from "./pages/AllCasesPage";
import CasePage from "./pages/CasePage";
import CasesIndexPage from "./pages/CasesIndexPage";
import NewsPage from "./pages/NewsPage";
import NewsPostPage from "./pages/NewsPostPage";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";

// Lazy load heavy components
const LazyMapView = lazy(() => import("./components/MapView"));
const LazyCaseModal = lazy(() => import("./components/CaseModal"));
const LazyNewsDetailModal = lazy(() => import("./components/NewsDetailModal"));

const queryClient = new QueryClient();

// Old /blog URLs keep working — everything is news now
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <PerformanceOptimizations />
        <SEOAnalytics />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/cases" element={<AllNewsPage />} />
            <Route path="/cases-index" element={<CasesIndexPage />} />
            <Route path="/case/:id" element={<CasePage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:slug" element={<NewsPostPage />} />
            <Route path="/sys-mgmt-portal-auth" element={<AdminLogin />} />
            <Route
              path="/sys-mgmt-portal"
              element={
                <ProtectedRoute>
                  <LazyWrapper>
                    <LazyAdminDashboard />
                  </LazyWrapper>
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
