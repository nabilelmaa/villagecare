"use client";

import { useState, useEffect, type SetStateAction } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import {
  Clock,
  Calendar,
  Heart,
  MessageCircle,
  Star,
  Filter,
  Search,
  Loader2,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";

import { useUserData } from "../contexts/UserContext";
import { useToast } from "../contexts/ToastContext";

import { Service, Review } from "../types/index";

interface Volunteer {
  id: number;
  first_name: string;
  last_name: string;
  bio: string;
  profile_image_url: string | null;
  rating: string;
  review_count: number;
  city: string;
  gender: string;
  services: {
    id: number;
    name: string;
    description: string | null;
  }[];
  availabilities: {
    day_of_week: string;
    time_of_day: string;
  }[];
  isFavorite?: boolean;
}

interface RequestFormData {
  service_id: number | null;
  day_of_week: string;
  time_of_day: string;
  details: string;
  urgent: boolean;
  volunteer_id: number;
}

interface FiltersState {
  services: {
    walks: boolean;
    groceryShopping: boolean;
    mealPreparation: boolean;
    transportation: boolean;
    healthcareSupport: boolean;
    friendlyConversation: boolean;
  };
  weekDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("volunteers");
  const [matchedVolunteers, setMatchedVolunteers] = useState<Volunteer[]>([]);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFindingMatch, setIsFindingMatch] = useState(false);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([]);
  const [noMatchFound, setNoMatchFound] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    services: {
      walks: false,
      groceryShopping: false,
      mealPreparation: false,
      transportation: false,
      healthcareSupport: false,
      friendlyConversation: false,
    },
    weekDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
  });

  // Reviews state
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(
    null
  );
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Request Help state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestVolunteer, setRequestVolunteer] = useState<Volunteer | null>(
    null
  );
  const [requestFormData, setRequestFormData] = useState<RequestFormData>({
    service_id: null,
    day_of_week: "",
    time_of_day: "",
    details: "",
    urgent: false,
    volunteer_id: 0,
  });
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    service_id?: string;
    day_of_week?: string;
    time_of_day?: string;
    details?: string;
  }>({});
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  const { userData, currentRole } = useUserData();
  const { showToast } = useToast();
  const [animateCards, setAnimateCards] = useState(false);

  // Function to fetch services from the API
  const fetchServices = async () => {
    setIsLoadingServices(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        return;
      }

      const response = await fetch("http://localhost:5000/api/user/services", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch services");
      }

      const data = await response.json();
      setServices(data.services);
    } catch (error) {
      console.error("Error fetching services:", error);
      showToast("Failed to load services", "error");
    } finally {
      setIsLoadingServices(false);
    }
  };

  // Function to check if volunteers are favorites
  const checkFavoriteStatus = async (
    volunteers: Volunteer[]
  ): Promise<Volunteer[]> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        return volunteers;
      }

      // Create a copy of volunteers with isFavorite property
      const volunteersWithFavoriteStatus = [...volunteers];

      // Check favorite status for each volunteer
      for (let i = 0; i < volunteersWithFavoriteStatus.length; i++) {
        const volunteer = volunteersWithFavoriteStatus[i];
        const response = await fetch(
          `http://localhost:5000/api/favorites/${volunteer.id}/check`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          volunteersWithFavoriteStatus[i] = {
            ...volunteer,
            isFavorite: data.isFavorite,
          };
        }
      }

      return volunteersWithFavoriteStatus;
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return volunteers.map((volunteer) => ({
        ...volunteer,
        isFavorite: false,
      }));
    }
  };

  // Function to toggle favorite status
  const toggleFavorite = async (
    volunteerId: number,
    isCurrentlyFavorite: boolean
  ) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        return;
      }

      if (isCurrentlyFavorite) {
        // Remove from favorites
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

        if (response.ok) {
          showToast("Removed from favorites", "success");
          // Update the volunteers state
          setVolunteers((prevVolunteers) =>
            prevVolunteers.map((volunteer) =>
              volunteer.id === volunteerId
                ? { ...volunteer, isFavorite: false }
                : volunteer
            )
          );
          setFilteredVolunteers((prevVolunteers) =>
            prevVolunteers.map((volunteer) =>
              volunteer.id === volunteerId
                ? { ...volunteer, isFavorite: false }
                : volunteer
            )
          );
          // Also update matched volunteers if any
          setMatchedVolunteers((prevVolunteers) =>
            prevVolunteers.map((volunteer) =>
              volunteer.id === volunteerId
                ? { ...volunteer, isFavorite: false }
                : volunteer
            )
          );
        } else {
          throw new Error("Failed to remove from favorites");
        }
      } else {
        // Add to favorites
        const response = await fetch(
          `http://localhost:5000/api/favorites/add`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ volunteer_id: volunteerId }),
          }
        );

        if (response.ok) {
          showToast("Added to favorites", "success");
          // Update the volunteers state
          setVolunteers((prevVolunteers) =>
            prevVolunteers.map((volunteer) =>
              volunteer.id === volunteerId
                ? { ...volunteer, isFavorite: true }
                : volunteer
            )
          );
          setFilteredVolunteers((prevVolunteers) =>
            prevVolunteers.map((volunteer) =>
              volunteer.id === volunteerId
                ? { ...volunteer, isFavorite: true }
                : volunteer
            )
          );
          // Also update matched volunteers if any
          setMatchedVolunteers((prevVolunteers) =>
            prevVolunteers.map((volunteer) =>
              volunteer.id === volunteerId
                ? { ...volunteer, isFavorite: true }
                : volunteer
            )
          );
        } else {
          throw new Error("Failed to add to favorites");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "An error occurred while updating favorites",
        "error"
      );
    }
  };

  // Function to open the request help modal
  const openRequestModal = (volunteer: Volunteer) => {
    setRequestVolunteer(volunteer);
    setRequestFormData({
      service_id: null,
      day_of_week: "",
      time_of_day: "",
      details: "",
      urgent: false,
      volunteer_id: volunteer.id,
    });
    setFormErrors({});
    fetchServices(); // Fetch services when opening the modal
    setShowRequestModal(true);
  };

  // Function to validate the request form
  const validateRequestForm = (): boolean => {
    const errors: {
      service_id?: string;
      day_of_week?: string;
      time_of_day?: string;
      details?: string;
    } = {};

    if (!requestFormData.service_id) {
      errors.service_id = "Please select a service";
    }

    if (!requestFormData.day_of_week) {
      errors.day_of_week = "Please select a day";
    }

    if (!requestFormData.time_of_day) {
      errors.time_of_day = "Please select a time";
    }

    if (!requestFormData.details.trim()) {
      errors.details = "Please provide details about your request";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Function to submit a help request
  const submitHelpRequest = async () => {
    if (!validateRequestForm()) {
      return;
    }

    setIsSubmittingRequest(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        return;
      }

      const response = await fetch("http://localhost:5000/api/requests/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit request");
      }

      showToast("Help request submitted successfully", "success");
      setShowRequestModal(false);

      // Refresh requests list
      // In a real app, you would fetch the updated requests list here
    } catch (error) {
      console.error("Error submitting help request:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "An error occurred while submitting your request",
        "error"
      );
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);

      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          showToast("Please log in again", "error");
          return;
        }
        const volunteersResponse = await fetch(
          "http://localhost:5000/api/volunteers",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!volunteersResponse.ok) {
          throw new Error("Failed to fetch volunteers");
        }
        const volunteersData = await volunteersResponse.json();

        const volunteersWithFavoriteStatus = await checkFavoriteStatus(
          volunteersData.volunteers
        );
        if (isMounted) {
          setVolunteers(volunteersWithFavoriteStatus);
          setFilteredVolunteers(volunteersWithFavoriteStatus);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showToast("Failed to load dashboard data", "error");
      } finally {
        if (isMounted) {
          setIsLoading(false);
          // Trigger animation after data is loaded
          setTimeout(() => setAnimateCards(true), 100);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  // Function to fetch reviews for a volunteer
  const fetchReviews = async (volunteerId: number) => {
    setIsLoadingReviews(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/user/${volunteerId}/reviews`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setReviews(data.reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      showToast("Failed to load reviews", "error");
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Function to submit a new review
  const submitReview = async () => {
    if (!selectedVolunteer) return;

    if (newReview.comment.trim() === "") {
      showToast("Please add a comment to your review", "error");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        return;
      }

      const response = await fetch("http://localhost:5000/api/reviews/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          volunteer_id: selectedVolunteer.id,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      showToast("Review submitted successfully", "success");

      // Reset form
      setNewReview({
        rating: 5,
        comment: "",
      });

      // Refresh reviews
      fetchReviews(selectedVolunteer.id);

      // Refresh volunteers to update ratings
      const volunteersResponse = await fetch(
        "http://localhost:5000/api/volunteers",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (volunteersResponse.ok) {
        const volunteersData = await volunteersResponse.json();
        const volunteersWithFavoriteStatus = await checkFavoriteStatus(
          volunteersData.volunteers
        );
        setVolunteers(volunteersWithFavoriteStatus);
        setFilteredVolunteers(
          applyFilters(volunteersWithFavoriteStatus, searchTerm, filters)
        );
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      showToast("Failed to submit review", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Function to open the reviews modal
  const openReviewsModal = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowReviewsModal(true);
    fetchReviews(volunteer.id);
  };

  // Function to find matching volunteers
  const handleFindMatch = async () => {
    setIsFindingMatch(true);
    setNoMatchFound(false);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/volunteers/match",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to find matching volunteers");
      }

      const data = await response.json();

      if (data.volunteers && data.volunteers.length > 0) {
        // Add favorite status to matched volunteers
        const volunteersWithFavoriteStatus = await checkFavoriteStatus(
          data.volunteers
        );
        setMatchedVolunteers(volunteersWithFavoriteStatus);
        setShowMatchModal(true);
      } else {
        setNoMatchFound(true);
        showToast(
          "No matching volunteers found. Please update your preferences in your profile.",
          "info"
        );
      }
    } catch (error) {
      console.error("Error finding matches:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "An error occurred while finding matches",
        "error"
      );
    } finally {
      setIsFindingMatch(false);
    }
  };

  const handleFilterChange = (
    category: string,
    item: string,
    value: boolean
  ) => {
    setFilters((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category as keyof typeof prev] as object),
        [item]: value,
      },
    }));
  };

  // Function to apply filters
  const applyFilters = (
    volunteers: Volunteer[],
    searchTerm: string,
    filters: FiltersState
  ) => {
    let result = volunteers;

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          `${v.first_name} ${v.last_name}`.toLowerCase().includes(term) ||
          v.bio.toLowerCase().includes(term) ||
          (v.city && v.city.toLowerCase().includes(term)) ||
          v.services.some((s) => s.name.toLowerCase().includes(term))
      );
    }

    // Apply service filters
    const activeServiceFilters = Object.entries(filters.services)
      .filter(([_, isActive]) => isActive)
      .map(([service]) => service);

    if (activeServiceFilters.length > 0) {
      result = result.filter((v) =>
        v.services.some((s) =>
          activeServiceFilters.some((filter) =>
            s.name
              .toLowerCase()
              .replace(/\s+/g, "")
              .includes(filter.toLowerCase())
          )
        )
      );
    }

    // Apply weekday filters
    const activeWeekDayFilters = Object.entries(filters.weekDays)
      .filter(([_, isActive]) => isActive)
      .map(([day]) => day);

    if (activeWeekDayFilters.length > 0) {
      result = result.filter((v) =>
        v.availabilities.some((a) =>
          activeWeekDayFilters.includes(a.day_of_week)
        )
      );
    }

    return result;
  };

  // Apply filters and search
  useEffect(() => {
    setFilteredVolunteers(applyFilters(volunteers, searchTerm, filters));
  }, [searchTerm, filters, volunteers]);

  // Helper function to format availability for display
  const formatAvailability = (volunteer: Volunteer): string => {
    if (!volunteer.availabilities) {
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

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-rose-600" />
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex flex-1">
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#EAAFC8] to-[#EC2F4B]">
                  Welcome Back, {userData?.first_name || "User"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {currentRole === "elder"
                    ? "Let's find the perfect volunteer for your needs"
                    : "Find opportunities to help in your community"}
                </p>
              </div>
              {currentRole === "elder" && (
                <Button
                  onClick={handleFindMatch}
                  disabled={isFindingMatch}
                  className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white shadow-md shadow-rose-200/50 rounded-xl px-6 py-2.5 h-auto"
                >
                  {isFindingMatch ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Finding Matches...
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-5 w-5" />
                      Find My Volunteer
                    </>
                  )}
                </Button>
              )}
            </div>

            {noMatchFound && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start">
                <AlertCircle className="text-amber-500 h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-amber-800">
                    No matches found
                  </h3>
                  <p className="text-amber-700 text-sm mt-1">
                    We couldn't find any volunteers matching your preferences.
                    Please update your profile with your service needs and
                    availability to improve matching.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100"
                    onClick={() => (window.location.href = "/profile")}
                  >
                    Update Preferences
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder={
                      currentRole === "elder"
                        ? "Search volunteers by name, skills, city, or keywords..."
                        : "Search for help requests..."
                    }
                    className="pl-10 py-6 bg-gray-50 border-gray-100 rounded-xl"
                    value={searchTerm}
                    onChange={(e: {
                      target: { value: SetStateAction<string> };
                    }) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl px-4"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-5 w-5" />
                  Filters
                  {(Object.values(filters.services).some(Boolean) ||
                    Object.values(filters.weekDays).some(Boolean)) && (
                    <Badge className="ml-2 bg-rose-100 text-rose-800 hover:bg-rose-200">
                      Active
                    </Badge>
                  )}
                </Button>
              </div>

              {isFilterOpen && (
                <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Services</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "walks", label: "Walks" },
                        { id: "groceryShopping", label: "Grocery Shopping" },
                        { id: "mealPreparation", label: "Meal Preparation" },
                        { id: "transportation", label: "Transportation" },
                        {
                          id: "healthcareSupport",
                          label: "Healthcare Support",
                        },
                        { id: "friendlyConversation", label: "Conversation" },
                      ].map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center space-x-2"
                        >
                          <Switch
                            id={`service-${service.id}`}
                            checked={
                              filters.services[
                                service.id as keyof typeof filters.services
                              ]
                            }
                            onCheckedChange={(checked: boolean) =>
                              handleFilterChange(
                                "services",
                                service.id,
                                checked
                              )
                            }
                          />
                          <Label
                            htmlFor={`service-${service.id}`}
                            className="text-sm"
                          >
                            {service.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">
                      Week Days
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "monday", label: "Monday" },
                        { id: "tuesday", label: "Tuesday" },
                        { id: "wednesday", label: "Wednesday" },
                        { id: "thursday", label: "Thursday" },
                        { id: "friday", label: "Friday" },
                        { id: "saturday", label: "Saturday" },
                        { id: "sunday", label: "Sunday" },
                      ].map((day) => (
                        <div
                          key={day.id}
                          className="flex items-center space-x-2"
                        >
                          <Switch
                            id={`day-${day.id}`}
                            checked={
                              filters.weekDays[
                                day.id as keyof typeof filters.weekDays
                              ]
                            }
                            onCheckedChange={(checked: boolean) =>
                              handleFilterChange("weekDays", day.id, checked)
                            }
                          />
                          <Label htmlFor={`day-${day.id}`} className="text-sm">
                            {day.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Tabs
              defaultValue={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                <TabsTrigger
                  value="volunteers"
                  className="rounded-lg data-[state=active]:bg-rose-50 data-[state=active]:text-rose-900 data-[state=active]:shadow-sm"
                >
                  {currentRole === "elder"
                    ? "Available Volunteers"
                    : "Help Requests"}
                </TabsTrigger>
                <TabsTrigger
                  value="requests"
                  className="rounded-lg data-[state=active]:bg-rose-50 data-[state=active]:text-rose-900 data-[state=active]:shadow-sm"
                >
                  {currentRole === "elder" ? "My Requests" : "My Offers"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="volunteers" className="space-y-6 mt-6">
                {filteredVolunteers.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-rose-600" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No results found
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      {currentRole === "elder"
                        ? "We couldn't find any volunteers matching your current filters. Try adjusting your search criteria."
                        : "We couldn't find any help requests matching your current filters. Try adjusting your search criteria."}
                    </p>
                    <Button
                      variant="outline"
                      className="border-rose-200 text-rose-700 hover:bg-rose-50"
                      onClick={() => {
                        setSearchTerm("");
                        setFilters({
                          services: {
                            walks: false,
                            groceryShopping: false,
                            mealPreparation: false,
                            transportation: false,
                            healthcareSupport: false,
                            friendlyConversation: false,
                          },
                          weekDays: {
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false,
                            sunday: false,
                          },
                        });
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVolunteers.map((volunteer, index) => (
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
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                {volunteer.city.charAt(0).toUpperCase() +
                                  volunteer.city.slice(1) ||
                                  "Location not specified"}
                              </div>
                            </div>
                            <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                              <AvatarImage
                                src={
                                  volunteer.profile_image_url ||
                                  "/placeholder.svg?height=100&width=100" ||
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
                            {volunteer.services &&
                              volunteer.services.map((service) => (
                                <Badge
                                  key={service.id}
                                  variant="outline"
                                  className="bg-rose-50 border-rose-100 text-rose-800"
                                >
                                  {service.name}
                                </Badge>
                              ))}
                          </div>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {volunteer.bio}
                          </p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`rounded-lg ${
                              volunteer.isFavorite
                                ? "text-rose-600"
                                : "text-gray-400"
                            } hover:text-rose-600 hover:bg-rose-50`}
                            onClick={(e: { stopPropagation: () => void }) => {
                              e.stopPropagation();
                              toggleFavorite(
                                volunteer.id,
                                volunteer.isFavorite || false
                              );
                            }}
                          >
                            <Heart
                              className={`h-5 w-5 ${
                                volunteer.isFavorite ? "fill-rose-600" : ""
                              }`}
                            />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                            onClick={() => openReviewsModal(volunteer)}
                          >
                            <Star className="h-4 w-4 mr-1.5" />
                            Reviews
                          </Button>
                          {currentRole === "elder" ? (
                            <Button
                              size="sm"
                              className="rounded-lg bg-rose-600 hover:bg-rose-700"
                              onClick={() => openRequestModal(volunteer)}
                            >
                              Request Help
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                            >
                              <MessageCircle className="h-4 w-4 mr-1.5" />
                              Message
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="requests" className="space-y-6 mt-6">
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Please visit the Requests page to view your requests.
                  </p>
                  <Button
                    className="mt-4 bg-rose-600 hover:bg-rose-700"
                    onClick={() => (window.location.href = "/requests")}
                  >
                    Go to Requests
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Match Modal */}
          {showMatchModal && matchedVolunteers.length > 0 && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
              <div className="relative max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <Card className="border-0 shadow-2xl overflow-hidden rounded-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-full opacity-50 blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-100 rounded-full opacity-50 blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>

                  <CardHeader className="text-center relative z-10 pb-0">
                    <div className="mt-2">
                      <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-700 to-rose-500">
                        Perfect Matches Found!
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Based on your preferences and needs, we found{" "}
                        {matchedVolunteers.length} volunteer
                        {matchedVolunteers.length > 1 ? "s" : ""} that match
                        your profile
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {matchedVolunteers.map((volunteer, index) => (
                        <div
                          key={volunteer.id}
                          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
                        >
                          <div className="flex items-center p-4 border-b border-gray-100">
                            <Avatar className="h-14 w-14 border-2 border-white shadow-md mr-4">
                              <AvatarImage
                                src={
                                  volunteer.profile_image_url ||
                                  "/placeholder.svg?height=100&width=100" ||
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
                            <div>
                              <h3 className="text-lg font-bold">
                                {volunteer.first_name} {volunteer.last_name}
                              </h3>
                              <div className="flex items-center mt-1">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="text-sm font-medium">
                                  {Number.parseFloat(volunteer.rating).toFixed(
                                    1
                                  )}
                                </span>
                                <span className="text-xs text-gray-500 ml-1">
                                  ({volunteer.review_count} reviews)
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                              {volunteer.city || "Location not specified"}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              {formatAvailability(volunteer)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Services:
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {volunteer.services &&
                                  volunteer.services.map((service) => (
                                    <Badge
                                      key={service.id}
                                      variant="outline"
                                      className="bg-rose-50 border-rose-100 text-rose-800"
                                    >
                                      {service.name}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              {volunteer.bio}
                            </p>
                            <div className="flex justify-between pt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`rounded-lg ${
                                  volunteer.isFavorite
                                    ? "text-rose-600"
                                    : "text-gray-400"
                                } hover:text-rose-600 hover:bg-rose-50`}
                                onClick={() => {
                                  toggleFavorite(
                                    volunteer.id,
                                    volunteer.isFavorite || false
                                  );
                                }}
                              >
                                <Heart
                                  className={`h-5 w-5 ${
                                    volunteer.isFavorite ? "fill-rose-600" : ""
                                  }`}
                                />
                              </Button>
                              <Button
                                size="sm"
                                className="rounded-lg bg-rose-600 hover:bg-rose-700"
                                onClick={() => {
                                  setShowMatchModal(false);
                                  openRequestModal(volunteer);
                                }}
                              >
                                Request Help
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center pt-0 relative z-10">
                    <Button
                      variant="outline"
                      onClick={() => setShowMatchModal(false)}
                      className="border-rose-200 text-rose-700 hover:bg-rose-50"
                    >
                      Close
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}

          {/* Reviews Modal */}
          <Dialog open={showReviewsModal} onOpenChange={setShowReviewsModal}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Reviews for {selectedVolunteer?.first_name}{" "}
                  {selectedVolunteer?.last_name}
                </DialogTitle>
                <DialogDescription>
                  {selectedVolunteer?.review_count} reviews with an average
                  rating of{" "}
                  {selectedVolunteer?.rating
                    ? Number.parseFloat(selectedVolunteer.rating).toFixed(1)
                    : "0"}{" "}
                  out of 5
                </DialogDescription>
              </DialogHeader>

              {isLoadingReviews ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-rose-500 mr-2" />
                  <p>Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No reviews yet for this volunteer.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 my-4">
                  {reviews.map((review, index) => (
                    <div
                      key={index}
                      className="border border-gray-100 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                                }`}
                                fill={
                                  star <= review.rating
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            ))}
                          </div>
                          <p className="font-medium text-sm">
                            {review.elder_first_name} {review.elder_last_name}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {currentRole === "elder" && (
                <>
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Leave a Review
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="rating" className="block mb-2">
                          Rating
                        </Label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setNewReview({ ...newReview, rating: star })
                              }
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  star <= newReview.rating
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                                }`}
                                fill={
                                  star <= newReview.rating
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="comment" className="block mb-2">
                          Comment
                        </Label>
                        <Textarea
                          id="comment"
                          placeholder="Share your experience with this volunteer..."
                          value={newReview.comment}
                          onChange={(e: { target: { value: any } }) =>
                            setNewReview({
                              ...newReview,
                              comment: e.target.value,
                            })
                          }
                          className="w-full"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowReviewsModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={submitReview}
                      className="bg-rose-600 hover:bg-rose-700"
                      disabled={isSubmittingReview}
                    >
                      {isSubmittingReview ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Review"
                      )}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Request Help Modal */}
          <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Request Help</DialogTitle>
                <DialogDescription>
                  Fill out the form below to request help from{" "}
                  {requestVolunteer?.first_name} {requestVolunteer?.last_name}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Service Selection */}
                <div className="space-y-2">
                  <Label htmlFor="service">
                    Service Type <span className="text-rose-500">*</span>
                  </Label>
                  {isLoadingServices ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                      <span className="text-sm text-gray-500">
                        Loading services...
                      </span>
                    </div>
                  ) : (
                    <Select
                      value={requestFormData.service_id?.toString() || ""}
                      onValueChange={(value: string) =>
                        setRequestFormData({
                          ...requestFormData,
                          service_id: Number.parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger
                        className={
                          formErrors.service_id
                            ? "border-rose-500 focus:ring-rose-500"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem
                            key={service.id}
                            value={service.id.toString()}
                          >
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {formErrors.service_id && (
                    <p className="text-sm text-rose-500 flex items-center mt-1">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" />
                      {formErrors.service_id}
                    </p>
                  )}
                </div>

                {/* Day of Week */}
                <div className="space-y-2">
                  <Label htmlFor="day_of_week">
                    Day of Week <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={requestFormData.day_of_week}
                    onValueChange={(value: any) =>
                      setRequestFormData({
                        ...requestFormData,
                        day_of_week: value,
                      })
                    }
                  >
                    <SelectTrigger
                      className={
                        formErrors.day_of_week
                          ? "border-rose-500 focus:ring-rose-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select a day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                      <SelectItem value="saturday">Saturday</SelectItem>
                      <SelectItem value="sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.day_of_week && (
                    <p className="text-sm text-rose-500 flex items-center mt-1">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" />
                      {formErrors.day_of_week}
                    </p>
                  )}
                </div>

                {/* Time of Day */}
                <div className="space-y-2">
                  <Label htmlFor="time_of_day">
                    Time of Day <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={requestFormData.time_of_day}
                    onValueChange={(value: any) =>
                      setRequestFormData({
                        ...requestFormData,
                        time_of_day: value,
                      })
                    }
                  >
                    <SelectTrigger
                      className={
                        formErrors.time_of_day
                          ? "border-rose-500 focus:ring-rose-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.time_of_day && (
                    <p className="text-sm text-rose-500 flex items-center mt-1">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" />
                      {formErrors.time_of_day}
                    </p>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <Label htmlFor="details">
                    Details <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    id="details"
                    placeholder="Please provide details about your request..."
                    value={requestFormData.details}
                    onChange={(e: { target: { value: any } }) =>
                      setRequestFormData({
                        ...requestFormData,
                        details: e.target.value,
                      })
                    }
                    className={
                      formErrors.details
                        ? "border-rose-500 focus:ring-rose-500"
                        : ""
                    }
                    rows={4}
                  />
                  {formErrors.details && (
                    <p className="text-sm text-rose-500 flex items-center mt-1">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" />
                      {formErrors.details}
                    </p>
                  )}
                </div>

                {/* Urgent */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="urgent"
                    checked={requestFormData.urgent}
                    onCheckedChange={(checked: boolean) =>
                      setRequestFormData({
                        ...requestFormData,
                        urgent: checked === true,
                      })
                    }
                  />
                  <Label
                    htmlFor="urgent"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    This is an urgent request
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowRequestModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitHelpRequest}
                  className="bg-rose-600 hover:bg-rose-700"
                  disabled={isSubmittingRequest}
                >
                  {isSubmittingRequest ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
