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
import { Heart, Star, Loader2, Search, AlertCircle } from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { Input } from "../components/ui/input";
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
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

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
  gender?: string;
  city?: string;
}

interface RequestFormData {
  service_id: number | null;
  day_of_week: string;
  time_of_day: string;
  details: string;
  urgent: boolean;
  volunteer_id: number;
}

interface Service {
  id: number;
  name: string;
  description: string | null;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Volunteer[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [animateCards, setAnimateCards] = useState(false);

  const { showToast } = useToast();

  // Add these state variables inside the FavoritesPage component
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

  // Add these state variables after the other state declarations
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(
    null
  );
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

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

    if (!requestFormData.details.trim()) {
      errors.details = "Please provide details about your request";
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

      showToast("Help request submitted successfully", "success");
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

  // Add this function before the return statement
  const openReviewsModal = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowReviewsModal(true);
    fetchReviews(volunteer.id);
  };

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

  // Add the formatDate function
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
                } ${
                  volunteer.gender === "male"
                    ? "bg-gradient-to-br from-white to-blue-50"
                    : "bg-gradient-to-br from-white to-rose-50"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center justify-between">
                    {volunteer.first_name} {volunteer.last_name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-gray-100 rounded-full p-2 -mr-2"
                      onClick={() => removeFromFavorites(volunteer.id)}
                    >
                      <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
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
                        {Number.parseFloat(volunteer.rating).toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({volunteer.review_count} reviews)
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{volunteer.city}</p>
                  </div>
                </CardContent>
                <CardContent>
                  <p className="text-sm text-gray-700">{volunteer.bio}</p>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-800">
                      Services:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {volunteer.services &&
                        volunteer.services.map((service) => (
                          <li key={service.id}>{service.name}</li>
                        ))}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-800">
                      Availability:
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatAvailability(volunteer)}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openReviewsModal(volunteer)}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Reviews
                  </Button>
                  <Button
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700"
                    onClick={() => openRequestModal(volunteer)}
                  >
                    Request Help
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
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
      {/* Add the Reviews Modal at the end of the component, right before the closing </div> of the container */}
      <Dialog open={showReviewsModal} onOpenChange={setShowReviewsModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Reviews for {selectedVolunteer?.first_name}{" "}
              {selectedVolunteer?.last_name}
            </DialogTitle>
            <DialogDescription>
              {selectedVolunteer?.review_count} reviews with an average rating
              of{" "}
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
                              star <= review.rating ? "currentColor" : "none"
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
