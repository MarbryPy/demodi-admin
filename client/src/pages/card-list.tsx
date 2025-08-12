import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Plus } from "lucide-react";
import { Link } from "wouter";
import Nav from "@/components/nav";
import type { Carte } from "@shared/schema";

type SortOption = "titre" | "categorie" | "alignement" | "rarete" | "cree_a";
type SortDirection = "asc" | "desc";

export default function CardList() {
  const [sortBy, setSortBy] = useState<SortOption>("cree_a");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const { data: cards = [], isLoading, error } = useQuery<Carte[]>({
    queryKey: ["/api/cards"],
  });

  const sortedCards = [...cards].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) aValue = "";
    if (bValue === null || bValue === undefined) bValue = "";

    // Convert to string for comparison
    aValue = String(aValue).toLowerCase();
    bValue = String(bValue).toLowerCase();

    const comparison = aValue.localeCompare(bValue);
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const getCategorieColor = (categorie: string) => {
    return categorie === "basic" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
         : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
  };

  const getAlignementColor = (alignement: string) => {
    return alignement === "blessed" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
         : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  const getRareteColor = (rarete: string | null) => {
    if (!rarete) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    switch (rarete) {
      case "common": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      case "uncommon": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "rare": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg text-muted-foreground">Chargement des cartes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg text-red-600 dark:text-red-400">
            Erreur lors du chargement des cartes
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Nav onLogout={() => window.location.href = '/'} />
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="page-title">
              Toutes les Cartes DémoDi
            </h1>
            <p className="text-muted-foreground mt-1">
              {cards.length} carte{cards.length !== 1 ? "s" : ""} au total
            </p>
          </div>
          <Link href="/admin/cards/new">
            <Button data-testid="button-create-card" className="min-h-11">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Carte
            </Button>
          </Link>
        </div>

        {/* Sort Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Trier par
                </label>
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger data-testid="select-sort-by" className="min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="titre">Titre</SelectItem>
                    <SelectItem value="categorie">Catégorie</SelectItem>
                    <SelectItem value="alignement">Alignement</SelectItem>
                    <SelectItem value="rarete">Rareté</SelectItem>
                    <SelectItem value="cree_a">Date de création</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={toggleSortDirection}
                  data-testid="button-toggle-sort"
                  className="min-h-11"
                >
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  {sortDirection === "asc" ? "Croissant" : "Décroissant"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards Grid */}
        {sortedCards.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Aucune carte créée pour le moment</p>
                <Link href="/admin/cards/new">
                  <Button data-testid="button-create-first-card">
                    <Plus className="w-4 h-4 mr-2" />
                    Créer votre première carte
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedCards.map((card) => (
              <Card key={card.id} className="hover:shadow-md transition-shadow" data-testid={`card-item-${card.id}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2" data-testid={`card-title-${card.id}`}>
                    {card.titre}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className={getCategorieColor(card.categorie)} data-testid={`badge-category-${card.id}`}>
                      {card.categorie === "basic" ? "Basique" : "Spéciale"}
                    </Badge>
                    <Badge className={getAlignementColor(card.alignement)} data-testid={`badge-alignment-${card.id}`}>
                      {card.alignement === "blessed" ? "Bénie" : "Maudite"}
                    </Badge>
                    {card.rarete && (
                      <Badge className={getRareteColor(card.rarete)} data-testid={`badge-rarity-${card.id}`}>
                        {card.rarete === "common" ? "Commune" : 
                         card.rarete === "uncommon" ? "Peu commune" : "Rare"}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3" data-testid={`card-effect-${card.id}`}>
                    {card.effet}
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div data-testid={`card-visibility-${card.id}`}>
                      <strong>Visibilité:</strong> {card.visibilite_defaut === "face_up" ? "Face visible" : "Face cachée"}
                    </div>
                    <div data-testid={`card-revelation-${card.id}`}>
                      <strong>Révélation:</strong> {
                        card.comportement_revelation === "on_view_owner" ? "À la vue (propriétaire)" :
                        card.comportement_revelation === "on_steal_new_owner" ? "Au vol (nouveau propriétaire)" :
                        "Immédiate"
                      }
                    </div>
                    <div data-testid={`card-status-${card.id}`}>
                      <strong>Statut:</strong> {card.actif ? "Active" : "Inactive"}
                    </div>
                    <div data-testid={`card-date-${card.id}`}>
                      <strong>Créée:</strong> {card.cree_a ? new Date(card.cree_a).toLocaleDateString('fr-FR') : 'Date inconnue'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}