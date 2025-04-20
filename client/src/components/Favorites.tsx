"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import {
  Clock,
  Heart,
  MessageCircle,
  Star,
  Loader2,
  Search,
} from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { Input } from "../components/ui/input";

interface Volunteer {
  id: number;
  first_name: string;
  last_name: string;
  bio: string;
  profile_image_url: string | null;
  rating: string;
  review_count: number;
  services?: {
    id: number;
    name: string;
    description: string | null;
  }[];
  availabilities?: {
    day_of_week: string;
    time_of_day: string;
  }[];
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Volunteer[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [animateCards, setAnimateCards] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredFavorites(favorites);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = favorites.filter(
        (volunteer) =>
          `${volunteer.first_name} ${volunteer.last_name}`
            .toLowerCase()
            .includes(term) ||
          volunteer.bio.toLowerCase().includes(term) ||
          (volunteer.services &&
            volunteer.services.some((service) =>
              service.name.toLowerCase().includes(term)
            ))
      );
      setFilteredFavorites(filtered);
    }
  }, [searchTerm, favorites]);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/favorites", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch favorites");
      }

      const data = await response.json();
      setFavorites(data.favorites || []);
      setFilteredFavorites(data.favorites || []);

      setTimeout(() => setAnimateCards(true), 100);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to load favorites",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromFavorites = async (volunteerId: number) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/favorites/${volunteerId}/remove`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove from favorites");
      }

      showToast("Removed from favorites", "success");

      setFavorites((prevFavorites) =>
        prevFavorites.filter((favorite) => favorite.id !== volunteerId)
      );
    } catch (error) {
      console.error("Error removing from favorites:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "An error occurred while removing from favorites",
        "error"
      );
    }
  };

  const formatAvailability = (volunteer: Volunteer): string => {
    if (!volunteer.availabilities || volunteer.availabilities.length === 0) {
      return "Availability not specified";
    }

    const days = new Set(volunteer.availabilities.map((a) => a.day_of_week));
    const times = new Set(volunteer.availabilities.map((a) => a.time_of_day));

    let availabilityText = "";

    if (days.size > 0) {
      const daysList = Array.from(days).map(
        (day) => day.charAt(0).toUpperCase() + day.slice(1)
      );
      availabilityText += daysList.join(", ");
    }

    if (times.size > 0) {
      const timesList = Array.from(times).map(
        (time) => time.charAt(0).toUpperCase() + time.slice(1)
      );
      availabilityText += " (" + timesList.join(", ") + ")";
    }

    return availabilityText || "Availability not specified";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-rose-600" />
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading favorites...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Favorite Volunteers
          </h1>
          <p className="text-gray-500">Manage your saved volunteers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search your favorites..."
              className="pl-10 py-6 bg-gray-50 border-gray-100 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredFavorites.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center min-h-screen">
            <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-rose-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm ? "No matching favorites found" : "No favorites yet"}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {searchTerm
                ? "We couldn't find any favorites matching your search. Try a different search term."
                : "You haven't added any volunteers to your favorites yet. Browse volunteers and click the heart icon to add them to your favorites."}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                className="border-rose-200 text-rose-700 hover:bg-rose-50"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((volunteer, index) => (
              <Card
                key={volunteer.id}
                className={`overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl ${
                  animateCards
                    ? "animate-in fade-in slide-in-from-bottom-8"
                    : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  <div className="absolute bottom-4 left-4 z-20 flex items-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center shadow-sm">
                      <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">
                        {Number.parseFloat(volunteer.rating).toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({volunteer.review_count})
                      </span>
                    </div>
                  </div>
                  <div className="relative h-full w-full">
                    <img
                      src={
                        volunteer.profile_image_url ||
                        "/placeholder.svg?height=400&width=400" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                      alt={`${volunteer.first_name} ${volunteer.last_name}`}
                      className="object-cover h-full w-full"
                    />
                  </div>
                </div>
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold">
                        {volunteer.first_name} {volunteer.last_name}
                      </CardTitle>
                    </div>
                    <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                      <AvatarImage
                        src={
                          volunteer.profile_image_url ||
                          "/placeholder.svg?height=100&width=100" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={`${volunteer.first_name} ${volunteer.last_name}`}
                      />
                      <AvatarFallback className="bg-rose-100 text-rose-800">
                        {volunteer.first_name.charAt(0)}
                        {volunteer.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1 text-gray-400" />
                    {formatAvailability(volunteer)}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {volunteer.services && volunteer.services.length > 0 ? (
                      volunteer.services.map((service) => (
                        <Badge
                          key={service.id}
                          variant="outline"
                          className="bg-rose-50 border-rose-100 text-rose-800"
                        >
                          {service.name}
                        </Badge>
                      ))
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-gray-50 border-gray-100 text-gray-600"
                      >
                        No services specified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {volunteer.bio}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                    onClick={() => removeFromFavorites(volunteer.id)}
                  >
                    <Heart className="h-4 w-4 mr-1.5 fill-rose-600" />
                    Remove
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                  >
                    <MessageCircle className="h-4 w-4 mr-1.5" />
                    Message
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-lg bg-rose-600 hover:bg-rose-700"
                  >
                    Request Help
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
