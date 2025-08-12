import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Router, Route, Switch } from "wouter";
import LoginPage from "@/pages/login";
import CardManagementPage from "@/pages/card-management";
import CardList from "@/pages/card-list";
import NotFound from "@/pages/not-found";
import { checkAuthStatus } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const { data: authStatus, isLoading } = useQuery({
    queryKey: ["/api/auth/status"],
    queryFn: checkAuthStatus,
    retry: false,
  });

  useEffect(() => {
    if (authStatus !== undefined) {
      setIsAuthenticated(authStatus.authenticated);
    }
  }, [authStatus]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    queryClient.invalidateQueries({ queryKey: ["/api/auth/status"] });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    queryClient.clear();
  };

  if (isLoading || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Switch>
          <Route path="/admin/cards/new">
            <CardManagementPage onLogout={handleLogout} />
          </Route>
          <Route path="/admin/cards">
            <CardList />
          </Route>
          <Route path="/">
            <CardList />
          </Route>
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
