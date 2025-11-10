import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import WorkflowLibrary from "./pages/WorkflowLibrary";
import { Calendar } from "./pages/Calendar";
import TestWorkflow from "./pages/TestWorkflow";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";

const queryClient = new QueryClient();

// Detect Electron environment and use appropriate router
// HashRouter is required for Electron (file:// protocol)
// BrowserRouter provides clean URLs for web deployment
const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;
const Router = isElectron ? HashRouter : BrowserRouter;

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            {/* Main Layout with all pages */}
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/library" element={<WorkflowLibrary />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/test" element={<TestWorkflow />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            
            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
