import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import SystemOverview from "./pages/SystemOverview";
import Simulation from "./pages/Simulation";
import AESDemo from "./pages/AESDemo";
import Dashboard from "./pages/Dashboard";
import MLModel from "./pages/MLModel";
import Gallery from "./pages/Gallery";
import Team from "./pages/Team";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/system" element={<SystemOverview />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/aes" element={<AESDemo />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ml" element={<MLModel />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/team" element={<Team />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
