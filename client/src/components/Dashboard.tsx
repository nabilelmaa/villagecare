import { useState, useEffect, type SetStateAction } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
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
  Heart,
  MessageCircle,
  Star,
  Filter,
  Search,
  Loader2,
  AlertCircle,
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
import { useTranslation } from "react-i18next";

import type { Review } from "../types/index";
import { motion, AnimatePresence } from "framer-motion";

interface Service {
  id: number;
  name: string;
  name_en?: string;
  name_fr?: string;
  name_ar?: string;
  description: string | null;
  selected?: boolean;
}

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
    name_en?: string;
    name_fr?: string;
    name_ar?: string;
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
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("volunteers");
  const [matchedVolunteers, setMatchedVolunteers] = useState<Volunteer[]>([]);
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

  const [showCreativeLoading, setShowCreativeLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState(0);
  const loadingStages = [
    t("dashboard.findingMatch.analyzing"),
    t("dashboard.findingMatch.searching"),
    t("dashboard.findingMatch.checking"),
    t("dashboard.findingMatch.finding"),
    t("dashboard.findingMatch.almost"),
  ];

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
  const [isShowingMatchResults, setIsShowingMatchResults] = useState(false);

  const getLocalizedServiceName = (service: {
    name: string;
    name_en?: string;
    name_fr?: string;
    name_ar?: string;
  }) => {
    const currentLang = i18n.language;
    const langKey = `name_${currentLang}` as keyof typeof service;

    if (service[langKey]) {
      return service[langKey];
    }
    return service.name;
  };

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

  const checkFavoriteStatus = async (
    volunteers: Volunteer[]
  ): Promise<Volunteer[]> => {
    if (!volunteers || volunteers.length === 0) {
      return [];
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        return volunteers;
      }

      const volunteersWithFavoriteStatus = [...volunteers];

      for (let i = 0; i < volunteersWithFavoriteStatus.length; i++) {
        const volunteer = volunteersWithFavoriteStatus[i];
        try {
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
        } catch (error) {
          console.warn(
            `Failed to check favorite status for volunteer ${volunteer.id}:`,
            error
          );
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
          showToast(t("favorites.removedFromFavorites"), "success");

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
          showToast(t("favorites.addedToFavorites"), "success");

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
    fetchServices();
    setShowRequestModal(true);
  };

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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

      showToast(t("requests.requestSent"), "success");
      setShowRequestModal(false);
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
          setIsLoading(false);
          return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          const volunteersResponse = await fetch(
            "http://localhost:5000/api/volunteers",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          if (!volunteersResponse.ok) {
            const errorData = await volunteersResponse.json().catch(() => ({}));
            throw new Error(
              errorData.message ||
                `Server=>({}));
            throw new Error(
              errorData.message ||
                \`Server responded with status: ${volunteersResponse.status}`
            );
          }

          const volunteersData = await volunteersResponse.json();

          const volunteersArray = volunteersData.volunteers || [];

          if (isMounted) {
            const volunteersWithFavoriteStatus = await checkFavoriteStatus(
              volunteersArray
            );
            setVolunteers(volunteersWithFavoriteStatus);
            setFilteredVolunteers(volunteersWithFavoriteStatus);
          }
        } catch (fetchError) {
          if (fetchError instanceof Error && fetchError.name === "AbortError") {
            console.error("Request timed out");
            if (isMounted) {
              showToast(
                "Request timed out. Please check your connection and try again.",
                "error"
              );
            }
          } else {
            throw fetchError;
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (isMounted) {
          setVolunteers([]);
          setFilteredVolunteers([]);
          showToast(
            `Failed to load dashboard data: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            "error"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setTimeout(() => setAnimateCards(true), 100);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [showToast, t]);

  const fetchReviews = async (volunteerId: number) => {
    setIsLoadingReviews(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        setReviews([]);
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
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      showToast("Failed to load reviews", "error");
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const submitReview = async () => {
    if (!selectedVolunteer) return;

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

      showToast(t("dashboard.reviewSubmitted"), "success");

      setNewReview({
        rating: 5,
        comment: "",
      });

      fetchReviews(selectedVolunteer.id);

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
      showToast(t("dashboard.reviewNotSubmitted"), "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const openReviewsModal = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowReviewsModal(true);
    fetchReviews(volunteer.id);
  };

  const handleFindMatch = async () => {
    setIsFindingMatch(true);
    setNoMatchFound(false);
    setShowCreativeLoading(true);
    setLoadingProgress(0);
    setLoadingStage(0);

    const totalDuration = 3000; // 3 seconds total
    const progressInterval = 50; // Update every 50ms
    const totalSteps = totalDuration / progressInterval;
    const progressIncrement = 100 / totalSteps;

    let currentProgress = 0;
    const progressTimer = setInterval(() => {
      currentProgress += progressIncrement;
      setLoadingProgress(Math.min(currentProgress, 100));

      // loading stage based on progress
      if (currentProgress > 20 && loadingStage === 0) setLoadingStage(1);
      if (currentProgress > 40 && loadingStage === 1) setLoadingStage(2);
      if (currentProgress > 60 && loadingStage === 2) setLoadingStage(3);
      if (currentProgress > 80 && loadingStage === 3) setLoadingStage(4);

      if (currentProgress >= 100) {
        clearInterval(progressTimer);
      }
    }, progressInterval);

    let matchData = null;
    let matchError = null;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        matchError = "Please log in again";
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

      matchData = await response.json();
    } catch (error) {
      console.error("Error finding matches:", error);
      matchError =
        error instanceof Error
          ? error.message
          : "An error occurred while finding matches";
    }

    // the loading animation shows for at least 5 seconds
    const startTime = Date.now();
    const minimumLoadingTime = 5000; // 5 seconds
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

    setTimeout(async () => {
      setIsFindingMatch(false);
      setShowCreativeLoading(false);

      setTimeout(async () => {
        if (matchError) {
          showToast(matchError, "error");
          return;
        }

        if (matchData?.volunteers && matchData.volunteers.length > 0) {
          // only show the matched volunteers, not all volunteers
          const volunteersWithFavoriteStatus = await checkFavoriteStatus(
            matchData.volunteers
          );

          // updating both the main volunteers list and filtered list to show ONLY the matched volunteers
          setMatchedVolunteers(volunteersWithFavoriteStatus);
          setFilteredVolunteers(volunteersWithFavoriteStatus);

          setIsShowingMatchResults(true);

          showToast(t("dashboard.volunteerFound"), "success");

          setTimeout(() => {
            document
              .getElementById("volunteers-list")
              ?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        } else {
          setNoMatchFound(true);
          showToast(t("dashboard.noVolunteerFound"), "info");
        }
      }, 300);
    }, remainingTime);
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

  const applyFilters = (
    volunteers: Volunteer[],
    searchTerm: string,
    filters: FiltersState
  ) => {
    let result =
      isShowingMatchResults &&
      !searchTerm &&
      !Object.values(filters.services).some(Boolean) &&
      !Object.values(filters.weekDays).some(Boolean)
        ? matchedVolunteers
        : volunteers;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          `${v.first_name} ${v.last_name}`.toLowerCase().includes(term) ||
          v.bio.toLowerCase().includes(term) ||
          (v.city && v.city.toLowerCase().includes(term)) ||
          v.services.some((s) =>
            getLocalizedServiceName(s).toLowerCase().includes(term)
          )
      );
    }

    const activeServiceFilters = Object.entries(filters.services)
      .filter(([_, isActive]) => isActive)
      .map(([service]) => service);

    if (activeServiceFilters.length > 0) {
      result = result.filter((v) =>
        v.services.some((s) =>
          activeServiceFilters.some((filter) =>
            getLocalizedServiceName(s)
              .toLowerCase()
              .replace(/\s+/g, "")
              .includes(filter.toLowerCase())
          )
        )
      );
    }

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

  useEffect(() => {
    setFilteredVolunteers(applyFilters(volunteers, searchTerm, filters));
  }, [searchTerm, filters, volunteers]);

  const formatAvailability = (volunteer: Volunteer): string => {
    if (!volunteer.availabilities) {
      return t("dashboard.availabilityNotSpecified");
    }

    const days = new Set(volunteer.availabilities.map((a) => a.day_of_week));
    const times = new Set(volunteer.availabilities.map((a) => a.time_of_day));

    let availabilityText = "";

    if (days.size > 0) {
      const daysList = Array.from(days).map((day) =>
        t(`dashboard.days.${day}`)
      );
      availabilityText += daysList.join(", ");
    }

    if (times.size > 0) {
      const timesList = Array.from(times).map((time) =>
        t(`dashboard.times.${time}`)
      );
      availabilityText += " (" + timesList.join(", ") + ")";
    }

    return availabilityText || t("dashboard.availabilityNotSpecified");
  };

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
            {t("dashboard.loading")}
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
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-3 md:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#EAAFC8] to-[#EC2F4B]">
                  {t("dashboard.welcome")}, {userData?.first_name || "User"}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {currentRole === "elder"
                    ? t("dashboard.findPerfectVolunteer")
                    : t("dashboard.findOpportunities")}
                </p>
              </div>
              {currentRole === "elder" && (
                <Button
                  onClick={handleFindMatch}
                  disabled={isFindingMatch}
                  className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white shadow-md shadow-rose-200/50 rounded-xl px-4 sm:px-6 py-2 sm:py-2.5 h-auto text-sm sm:text-base relative overflow-hidden group"
                >
                  <AnimatePresence mode="wait">
                    {showCreativeLoading ? (
                      <motion.div
                        key="loading"
                        className="flex flex-col items-center justify-center w-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-rose-700/30 to-pink-600/30" />

                        <div className="absolute inset-0 overflow-hidden">
                          {[...Array(8)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute bottom-0"
                              initial={{
                                x: Math.random() * 100 - 50,
                                y: 20,
                                opacity: 0,
                                scale: 0.5 + Math.random() * 0.5,
                              }}
                              animate={{
                                y: -60,
                                opacity: [0, 1, 0],
                                rotate: Math.random() * 360,
                              }}
                              transition={{
                                duration: 2 + Math.random() * 2,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.3,
                                ease: "easeOut",
                              }}
                              style={{
                                left: `${10 + i * 10}%`,
                              }}
                            >
                              <Heart
                                className="text-white/80 h-4 w-4"
                                fill="rgba(255,255,255,0.5)"
                              />
                            </motion.div>
                          ))}
                        </div>

                        {/* Progress bar */}
                        <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
                          <motion.div
                            className="h-full bg-white"
                            initial={{ width: 0 }}
                            animate={{ width: `${loadingProgress}%` }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>

                        {/* Loading text */}
                        <motion.div
                          className="relative z-10 text-center px-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          key={loadingStage}
                        >
                          {loadingStages[loadingStage]}
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="default"
                        className="flex items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Heart className="mr-2 h-5 w-5" />
                        {t("dashboard.findVolunteer")}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              )}
            </div>

            {showCreativeLoading && (
              <Dialog open={showCreativeLoading} onOpenChange={() => {}}>
                <DialogContent className="sm:max-w-md bg-gradient-to-br from-rose-500 to-pink-600 border-none text-white">
                  <div className="flex flex-col items-center justify-center py-8">
                    <motion.div
                      className="relative w-32 h-32 mb-6"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    >
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute"
                          style={{
                            top: `${50 + 40 * Math.sin(i * (Math.PI / 4))}%`,
                            left: `${50 + 40 * Math.cos(i * (Math.PI / 4))}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.25,
                            ease: "easeInOut",
                          }}
                        >
                          <Heart className="h-5 w-5 text-white" fill="white" />
                        </motion.div>
                      ))}

                      <motion.div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        animate={{
                          scale: [1, 1.5, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      >
                        <Heart className="h-10 w-10 text-white" fill="white" />
                      </motion.div>
                    </motion.div>

                    <h2 className="text-2xl font-bold mb-2 text-center">
                      {t("dashboard.findingVolunteer")}
                    </h2>

                    <motion.p
                      className="text-white/90 text-center mb-6"
                      key={loadingStage}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {loadingStages[loadingStage]}
                    </motion.p>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-white rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${loadingProgress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>

                    <p className="text-white/70 text-sm mt-4">
                      {t("dashboard.findingMatch.searching")}
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {noMatchFound && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start">
                <AlertCircle className="text-amber-500 h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-amber-800">
                    {t("dashboard.noMatchFound.title")}
                  </h3>
                  <p className="text-amber-700 text-sm mt-1">
                    {t("dashboard.noMatchFound.description")}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100"
                    onClick={() => (window.location.href = "/profile")}
                  >
                    {t("dashboard.noMatchFound.updatePreferences")}
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                  <Input
                    placeholder={
                      currentRole === "elder"
                        ? t("dashboard.searchPlaceholder")
                        : t("dashboard.searchRequestsPlaceholder")
                    }
                    className="pl-9 sm:pl-10 py-5 sm:py-6 bg-gray-50 border-gray-100 rounded-xl text-sm"
                    value={searchTerm}
                    onChange={(e: {
                      target: { value: SetStateAction<string> };
                    }) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl px-3 sm:px-4 py-2 whitespace-nowrap"
                  onClick={() => {
                    setIsFilterOpen(!isFilterOpen);
                    if (isFilterOpen && isShowingMatchResults) {
                      setIsShowingMatchResults(false);
                      setFilteredVolunteers(volunteers);
                    }
                  }}
                >
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                  {t("dashboard.filters")}
                  {(Object.values(filters.services).some(Boolean) ||
                    Object.values(filters.weekDays).some(Boolean) ||
                    isShowingMatchResults) && (
                    <Badge className="ml-2 bg-rose-100 text-rose-800 hover:bg-rose-200 text-xs">
                      {t("dashboard.active")}
                    </Badge>
                  )}
                </Button>
              </div>

              {isFilterOpen && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">
                      {t("dashboard.services")}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          id: "walks",
                          label: t("dashboard.serviceTypes.walks"),
                        },
                        {
                          id: "groceryShopping",
                          label: t("dashboard.serviceTypes.groceryShopping"),
                        },
                        {
                          id: "mealPreparation",
                          label: t("dashboard.serviceTypes.mealPreparation"),
                        },
                        {
                          id: "transportation",
                          label: t("dashboard.serviceTypes.transportation"),
                        },
                        {
                          id: "healthcareSupport",
                          label: t("dashboard.serviceTypes.healthcareSupport"),
                        },
                        {
                          id: "friendlyConversation",
                          label: t(
                            "dashboard.serviceTypes.friendlyConversation"
                          ),
                        },
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
                      {t("dashboard.weekDays")}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "monday", label: t("dashboard.days.monday") },
                        { id: "tuesday", label: t("dashboard.days.tuesday") },
                        {
                          id: "wednesday",
                          label: t("dashboard.days.wednesday"),
                        },
                        { id: "thursday", label: t("dashboard.days.thursday") },
                        { id: "friday", label: t("dashboard.days.friday") },
                        { id: "saturday", label: t("dashboard.days.saturday") },
                        { id: "sunday", label: t("dashboard.days.sunday") },
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
                  {t("dashboard.availableVolunteers")}
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="volunteers"
                className="space-y-6 mt-6"
                id="volunteers-list"
              >
                {filteredVolunteers.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-rose-600" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      {t("dashboard.noResultsFound")}
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      {currentRole === "elder"
                        ? t("dashboard.noResultsMessage.elder")
                        : t("dashboard.noResultsMessage.volunteer")}
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

                        if (isShowingMatchResults) {
                          setIsShowingMatchResults(false);
                          setFilteredVolunteers(volunteers);
                        }
                      }}
                    >
                      {t("dashboard.resetFilters")}
                    </Button>
                  </div>
                ) : (
                  <>
                    {isShowingMatchResults && (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center">
                          <Heart
                            className="text-rose-500 h-5 w-5 mr-3 flex-shrink-0"
                            fill="rgba(244,63,94,0.2)"
                          />
                          <div>
                            <h3 className="font-medium text-rose-800">
                              {t("dashboard.matchResults.title")}
                            </h3>
                            <p className="text-rose-700 text-sm">
                              {t("dashboard.matchResults.description", {
                                count: filteredVolunteers.length,
                              })}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-rose-200 text-rose-700 hover:bg-rose-100"
                          onClick={() => {
                            setIsShowingMatchResults(false);
                            setFilteredVolunteers(volunteers);
                          }}
                        >
                          {t("dashboard.matchResults.viewAll")}
                        </Button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {filteredVolunteers.map((volunteer, index) => (
                        <Card
                          key={volunteer.id}
                          className={`overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl ${
                            animateCards
                              ? "animate-in fade-in slide-in-from-bottom-8"
                              : "opacity-0"
                          } ${
                            volunteer.gender === "male"
                              ? "bg-gradient-to-br from-white to-blue-50"
                              : "bg-gradient-to-br from-white to-rose-50"
                          }`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-lg sm:text-xl font-semibold flex items-center justify-between">
                              {volunteer.first_name} {volunteer.last_name}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-gray-100 rounded-full p-1.5 sm:p-2 -mr-1.5 sm:-mr-2"
                                onClick={() =>
                                  toggleFavorite(
                                    volunteer.id,
                                    volunteer.isFavorite || false
                                  )
                                }
                              >
                                {volunteer.isFavorite ? (
                                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 fill-rose-500" />
                                ) : (
                                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                )}
                              </Button>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                              <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                                <AvatarImage
                                  src={volunteer.profile_image_url || ""}
                                  alt={volunteer.first_name}
                                />
                                <AvatarFallback>
                                  {volunteer.first_name[0]}
                                  {volunteer.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-amber-500" />
                                  <span className="text-sm font-medium text-gray-700">
                                    {volunteer.rating || "0"}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({volunteer.review_count}{" "}
                                    {t("dashboard.reviews")})
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                  {volunteer.city[0].toUpperCase()}
                                  {volunteer.city.slice(1)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                            <p className="text-sm text-gray-700 line-clamp-3">
                              {volunteer.bio}
                            </p>
                            <div className="mt-3 sm:mt-4">
                              <h4 className="text-xs sm:text-sm font-medium text-gray-800">
                                {t("dashboard.volunteerCard.services")}
                              </h4>
                              <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600">
                                {volunteer.services.map((service) => (
                                  <li key={service.id}>
                                    {getLocalizedServiceName(service)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="mt-3 sm:mt-4">
                              <h4 className="text-xs sm:text-sm font-medium text-gray-800">
                                {t("dashboard.volunteerCard.availability")}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {formatAvailability(volunteer)}
                              </p>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between items-center p-4 sm:p-6">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-xs sm:text-sm px-2 sm:px-3 py-1 h-8 sm:h-9"
                              onClick={() => openReviewsModal(volunteer)}
                            >
                              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              {t("dashboard.reviews")}
                            </Button>
                            {currentRole === "elder" && (
                              <Button
                                size="sm"
                                className="text-xs sm:text-sm px-2 sm:px-3 py-1 h-8 sm:h-9"
                                onClick={() => openRequestModal(volunteer)}
                              >
                                {t("requests.newRequest")}
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="requests">
                <p>This is where the requests or offers will be displayed.</p>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <Dialog open={showReviewsModal} onOpenChange={setShowReviewsModal}>
        <DialogContent className="w-[95vw] max-w-[500px] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {t("dashboard.reviewsModal.title")}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {t("dashboard.reviewsModal.description")}
            </DialogDescription>
          </DialogHeader>
          {selectedVolunteer && (
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={selectedVolunteer.profile_image_url || ""}
                  alt={selectedVolunteer.first_name}
                />
                <AvatarFallback>
                  {selectedVolunteer.first_name[0]}
                  {selectedVolunteer.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {selectedVolunteer.rating || "0"}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({selectedVolunteer.review_count} {t("dashboard.reviews")})
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {selectedVolunteer.first_name} {selectedVolunteer.last_name}
                </p>
              </div>
            </div>
          )}
          {isLoadingReviews ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <ul className="space-y-4">
              {reviews && reviews.length > 0 ? (
                reviews.slice(0, 3).map((review, index) => (
                  <li
                    key={review.id || index}
                    className="border rounded-md p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                          <AvatarImage
                            src={review.elder_profile_picture || ""}
                            alt={review.elder_first_name}
                          />
                          <AvatarFallback>
                            {review.elder_first_name[0]}
                            {review.elder_last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {review.elder_first_name} {review.elder_last_name}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  </li>
                ))
              ) : (
                <li className="text-center py-4 text-gray-500">
                  {t("dashboard.reviewsModal.noReviews")}
                </li>
              )}
            </ul>
          )}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              {t("dashboard.reviewsModal.addReview")}
            </h4>
            <div className="flex items-center space-x-3 mb-3">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant="ghost"
                  className={`p-1 rounded-full hover:bg-gray-100 ${
                    newReview.rating === rating ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setNewReview({ ...newReview, rating: rating })}
                >
                  <Star
                    className={`h-5 w-5 ${
                      newReview.rating === rating
                        ? "text-amber-500"
                        : "text-gray-400"
                    }`}
                  />
                </Button>
              ))}
            </div>
            <Textarea
              placeholder={t("dashboard.reviewsModal.addComment")}
              className="bg-gray-50 border-gray-100 rounded-md"
              value={newReview.comment}
              onChange={(e) =>
                setNewReview({ ...newReview, comment: e.target.value })
              }
            />
            <DialogFooter>
              <Button
                className="mt-2"
                type="submit"
                onClick={submitReview}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? (
                  <>
                    {t("dashboard.reviewsModal.submitting")}
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  t("dashboard.reviewsModal.submitReview")
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="w-[95vw] max-w-[425px] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {t("dashboard.requestModal.title")}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {t("dashboard.requestModal.description")}
            </DialogDescription>
          </DialogHeader>
          {requestVolunteer && (
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={requestVolunteer.profile_image_url || ""}
                  alt={requestVolunteer.first_name}
                />
                <AvatarFallback>
                  {requestVolunteer.first_name[0]}
                  {requestVolunteer.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {requestVolunteer.first_name} {requestVolunteer.last_name}
                </p>
                <p className="text-sm text-gray-500">
                  {" "}
                  {requestVolunteer.city[0].toUpperCase()}
                  {requestVolunteer.city.slice(1)}
                </p>
              </div>
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="service">
                {t("dashboard.requestModal.service")}
              </Label>
              <Select
                onValueChange={(value) =>
                  setRequestFormData({
                    ...requestFormData,
                    service_id: Number.parseInt(value),
                  })
                }
              >
                <SelectTrigger className="bg-gray-50 border-gray-100 rounded-md">
                  <SelectValue
                    placeholder={t("dashboard.requestModal.selectService")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingServices ? (
                    <SelectItem value="-1" disabled>
                      {t("dashboard.requestModal.loading")}
                    </SelectItem>
                  ) : (
                    services.map((service) => (
                      <SelectItem
                        key={service.id}
                        value={service.id.toString()}
                      >
                        {getLocalizedServiceName(service)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formErrors.service_id && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.service_id}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="day">{t("dashboard.requestModal.day")}</Label>
              <Select
                onValueChange={(value) =>
                  setRequestFormData({ ...requestFormData, day_of_week: value })
                }
              >
                <SelectTrigger className="bg-gray-50 border-gray-100 rounded-md">
                  <SelectValue
                    placeholder={t("dashboard.requestModal.selectDay")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                    "sunday",
                  ].map((day) => (
                    <SelectItem key={day} value={day}>
                      {t(`dashboard.days.${day}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.day_of_week && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.day_of_week}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="time">{t("dashboard.requestModal.time")}</Label>
              <Select
                onValueChange={(value) =>
                  setRequestFormData({ ...requestFormData, time_of_day: value })
                }
              >
                <SelectTrigger className="bg-gray-50 border-gray-100 rounded-md">
                  <SelectValue
                    placeholder={t("dashboard.requestModal.selectTime")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {["morning", "afternoon", "evening"].map((time) => (
                    <SelectItem key={time} value={time}>
                      {t(`dashboard.times.${time}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.time_of_day && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.time_of_day}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="details">
                {t("dashboard.requestModal.details")}
              </Label>
              <Textarea
                id="details"
                placeholder={t("dashboard.requestModal.detailsPlaceholder")}
                className="bg-gray-50 border-gray-100 rounded-md"
                value={requestFormData.details}
                onChange={(e) =>
                  setRequestFormData({
                    ...requestFormData,
                    details: e.target.value,
                  })
                }
              />
              {formErrors.details && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.details}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="urgent"
                checked={requestFormData.urgent}
                onCheckedChange={(checked) =>
                  setRequestFormData({
                    ...requestFormData,
                    urgent: Boolean(checked),
                  })
                }
              />
              <Label htmlFor="urgent">
                {t("dashboard.requestModal.urgent")}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={submitHelpRequest}
              disabled={isSubmittingRequest}
            >
              {isSubmittingRequest ? (
                <>
                  {t("dashboard.requestModal.submitting")}
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                t("dashboard.requestModal.submitRequest")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
