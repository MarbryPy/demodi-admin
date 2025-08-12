import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Gamepad2, LogOut, Plus, List } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/lib/auth";

interface NavProps {
  onLogout: () => void;
}

export default function Nav({ onLogout }: NavProps) {
  const [location] = useLocation();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      onLogout();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <Gamepad2 className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-foreground">DémoDi Admin</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex items-center space-x-2">
            <Link href="/admin/cards">
              <Button 
                variant={location === "/admin/cards" || location === "/" ? "default" : "ghost"}
                data-testid="nav-card-list"
                className="min-h-10"
              >
                <List className="w-4 h-4 mr-2" />
                Voir les Cartes
              </Button>
            </Link>
            <Link href="/admin/cards/new">
              <Button 
                variant={location === "/admin/cards/new" ? "default" : "ghost"}
                data-testid="nav-create-card"
                className="min-h-10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Carte
              </Button>
            </Link>
          </div>

          {/* Logout */}
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            data-testid="nav-logout"
            className="min-h-10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden flex space-x-2 pb-3">
          <Link href="/admin/cards">
            <Button 
              variant={location === "/admin/cards" || location === "/" ? "default" : "ghost"}
              size="sm"
              data-testid="nav-mobile-card-list"
              className="min-h-10 flex-1"
            >
              <List className="w-4 h-4 mr-1" />
              Cartes
            </Button>
          </Link>
          <Link href="/admin/cards/new">
            <Button 
              variant={location === "/admin/cards/new" ? "default" : "ghost"}
              size="sm"
              data-testid="nav-mobile-create-card"
              className="min-h-10 flex-1"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nouveau
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}