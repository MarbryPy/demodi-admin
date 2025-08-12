import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { insertCarteSchema, type InsertCarte, type Carte } from "@shared/schema";
import { Gamepad2, LogOut, Plus, RotateCcw, CheckCircle, Edit, ArrowRight } from "lucide-react";
import Nav from "@/components/nav";

interface CardManagementPageProps {
  onLogout: () => void;
}

export default function CardManagementPage({ onLogout }: CardManagementPageProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<InsertCarte>({
    resolver: zodResolver(insertCarteSchema),
    defaultValues: {
      titre: "",
      effet: "",
      categorie: undefined,
      alignement: undefined,
      visibilite_defaut: undefined,
      rarete: undefined,
      comportement_revelation: undefined,
      actif: true,
    },
  });

  // Fetch recent cards
  const { data: recentCards, isLoading: loadingCards } = useQuery({
    queryKey: ["/api/cards/recent"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/cards/recent");
      return response.json() as Promise<Carte[]>;
    },
  });

  const createCardMutation = useMutation({
    mutationFn: async (data: InsertCarte) => {
      const response = await apiRequest("POST", "/api/cards", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Card created successfully!",
      });
      setShowSuccess(true);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/cards/recent"] });
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create card. Please try again.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      onLogout();
    },
    onError: () => {
      // Force logout even if API call fails
      onLogout();
    },
  });

  const onSubmit = (data: InsertCarte) => {
    createCardMutation.mutate(data);
  };

  const handleReset = () => {
    form.reset();
    setShowSuccess(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getVisibilityBadgeColor = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'bg-green-100 text-green-700';
      case 'private':
        return 'bg-red-100 text-red-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Nav onLogout={onLogout} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 pb-8">
        
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg" data-testid="success-message">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-600 h-5 w-5" />
              <span className="text-sm font-medium text-green-700">Card created successfully!</span>
            </div>
          </div>
        )}

        {/* Card Creation Form */}
        <Card className="bg-white shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Create New Game Card</h2>
            <p className="text-gray-600 mt-1">Fill in the details below to add a new card to the database</p>
          </div>

          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                
                {/* Card Title */}
                <div className="space-y-2">
                  <Label htmlFor="titre" className="text-sm font-medium text-gray-900">
                    Card Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="titre"
                    data-testid="input-titre"
                    placeholder="Enter card title"
                    className="form-input"
                    {...form.register("titre")}
                  />
                  {form.formState.errors.titre && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-titre">
                      {form.formState.errors.titre.message}
                    </p>
                  )}
                </div>

                {/* Card Effect */}
                <div className="space-y-2">
                  <Label htmlFor="effet" className="text-sm font-medium text-gray-900">
                    Card Effect <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="effet"
                    data-testid="input-effet"
                    rows={4}
                    placeholder="Describe the card's effect and gameplay mechanics"
                    className="form-input resize-none"
                    {...form.register("effet")}
                  />
                  {form.formState.errors.effet && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-effet">
                      {form.formState.errors.effet.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Game Properties Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Game Properties</h3>
                
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="categorie" className="text-sm font-medium text-gray-900">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    onValueChange={(value) => {
                      form.setValue("categorie", value as any);
                      // If categorie is "special", disable and clear rarity
                      if (value === "special") {
                        form.setValue("rarete", null);
                      }
                    }}
                  >
                    <SelectTrigger data-testid="select-categorie" className="form-select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="special">Special</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categorie && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-categorie">
                      {form.formState.errors.categorie.message}
                    </p>
                  )}
                </div>

                {/* Alignment */}
                <div className="space-y-2">
                  <Label htmlFor="alignement" className="text-sm font-medium text-gray-900">
                    Alignment <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={(value) => form.setValue("alignement", value as any)}>
                    <SelectTrigger data-testid="select-alignement" className="form-select">
                      <SelectValue placeholder="Select alignment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blessed">Blessed</SelectItem>
                      <SelectItem value="cursed">Cursed</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.alignement && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-alignement">
                      {form.formState.errors.alignement.message}
                    </p>
                  )}
                </div>

                {/* Revelation Behavior */}
                <div className="space-y-2">
                  <Label htmlFor="comportement_revelation" className="text-sm font-medium text-gray-900">
                    Revelation Behavior <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={(value) => form.setValue("comportement_revelation", value as any)}>
                    <SelectTrigger data-testid="select-comportement_revelation" className="form-select">
                      <SelectValue placeholder="Select revelation behavior" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on_view_owner">On View Owner</SelectItem>
                      <SelectItem value="on_steal_new_owner">On Steal New Owner</SelectItem>
                      <SelectItem value="immediate">Immediate</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.comportement_revelation && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-comportement_revelation">
                      {form.formState.errors.comportement_revelation.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Visibility Settings Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Visibility Settings</h3>
                
                {/* Default Visibility */}
                <div className="space-y-2">
                  <Label htmlFor="visibilite_defaut" className="text-sm font-medium text-gray-900">
                    Default Visibility <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={(value) => form.setValue("visibilite_defaut", value as any)}>
                    <SelectTrigger data-testid="select-visibilite_defaut" className="form-select">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="face_up">Face Up</SelectItem>
                      <SelectItem value="face_down">Face Down</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.visibilite_defaut && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-visibilite_defaut">
                      {form.formState.errors.visibilite_defaut.message}
                    </p>
                  )}
                </div>

                {/* Grid: Additional Properties */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Rarity */}
                  <div className="space-y-2">
                    <Label htmlFor="rarete" className="text-sm font-medium text-gray-900">
                      Rarity {form.watch("categorie") === "special" && <span className="text-gray-500">(disabled for special cards)</span>}
                    </Label>
                    <Select 
                      onValueChange={(value) => form.setValue("rarete", value as any)}
                      disabled={form.watch("categorie") === "special"}
                    >
                      <SelectTrigger data-testid="select-rarete" className="form-select">
                        <SelectValue placeholder={form.watch("categorie") === "special" ? "N/A for special cards" : "Select rarity"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="common">Common</SelectItem>
                        <SelectItem value="uncommon">Uncommon</SelectItem>
                        <SelectItem value="rare">Rare</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.rarete && (
                      <p className="text-sm text-red-600 mt-1" data-testid="error-rarete">
                        {form.formState.errors.rarete.message}
                      </p>
                    )}
                  </div>

                  {/* Active Status */}
                  <div className="space-y-2">
                    <Label htmlFor="actif" className="text-sm font-medium text-gray-900">
                      Active Status
                    </Label>
                    <Select 
                      onValueChange={(value) => form.setValue("actif", value === "true")}
                      defaultValue="true"
                    >
                      <SelectTrigger data-testid="select-actif" className="form-select">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  data-testid="button-reset"
                  className="btn-secondary w-full sm:w-auto"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Form
                </Button>
                <Button
                  type="submit"
                  data-testid="button-submit"
                  className="btn-primary w-full sm:flex-1"
                  disabled={createCardMutation.isPending}
                >
                  {createCardMutation.isPending ? (
                    <>
                      <LoadingSpinner className="mr-2" size="sm" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Card
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Recent Cards Preview */}
        <Card className="mt-8 bg-white shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Recent Cards</h3>
            <p className="text-gray-600 mt-1">Last 5 cards created</p>
          </div>
          <CardContent className="p-6">
            {loadingCards ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : recentCards && recentCards.length > 0 ? (
              <div className="space-y-3">
                {recentCards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg" data-testid={`card-recent-${card.id}`}>
                    <div className="flex-1">
                      <h4 className="font-medium" data-testid={`text-title-${card.id}`}>{card.titre}</h4>
                      <p className="text-sm text-gray-600" data-testid={`text-details-${card.id}`}>
                        {card.categorie} • {card.alignement} • {card.comportement_revelation}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span 
                        className={`px-2 py-1 text-xs rounded-full ${getVisibilityBadgeColor(card.visibilite_defaut)}`}
                        data-testid={`badge-visibility-${card.id}`}
                      >
                        {card.visibilite_defaut}
                      </span>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-700 p-1">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="text-center mt-4">
                  <Button variant="link" className="text-blue-700 hover:text-blue-900 text-sm font-medium">
                    View All Cards <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No cards created yet. Create your first card above!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
