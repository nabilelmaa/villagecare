import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [favorites, setFavorites] = useState<Volunteer[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [animateCards, setAnimateCards] = useState(false);

  const { showToast } = useToast();

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
        showToast(t("common.loginAgain"), "error");
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
        throw new Error(t("favorites.fetchFailed"));
      }

      const data = await response.json();
      setFavorites(data.favorites || []);
      setFilteredFavorites(data.favorites || []);

      setTimeout(() => setAnimateCards(true), 100);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      showToast(
        error instanceof Error ? error.message : t("favorites.fetchFailed"),
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
        showToast(t("common.loginAgain"), "error");
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
        throw new Error(t("favorites.removeFailed"));
      }

      showToast(t("favorites.removedFromFavorites"), "success");

      setFavorites((prevFavorites) =>
        prevFavorites.filter((favorite) => favorite.id !== volunteerId)
      );
    } catch (error) {
      console.error("Error removing from favorites:", error);
      showToast(
        error instanceof Error ? error.message : t("favorites.removeFailed"),
        "error"
      );
    }
  };

  const formatAvailability = (volunteer: Volunteer): string => {
    if (!volunteer.availabilities || volunteer.availabilities.length === 0) {
      return t("favorites.availabilityNotSpecified");
    }

    const days = new Set(volunteer.availabilities.map((a) => a.day_of_week));
    const times = new Set(volunteer.availabilities.map((a) => a.time_of_day));

    let availabilityText = "";

    if (days.size > 0) {
      const daysList = Array.from(days).map((day) => t(`days.${day}`));
      availabilityText += daysList.join(", ");
    }

    if (times.size > 0) {
      const timesList = Array.from(times).map((time) => t(`timeOfDay.${time}`));
      availabilityText += " (" + timesList.join(", ") + ")";
    }

    return availabilityText || t("favorites.availabilityNotSpecified");
  };

  const fetchServices = async () => {
    setIsLoadingServices(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast(t("common.loginAgain"), "error");
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
        throw new Error(t("favorites.servicesFetchFailed"));
      }

      const data = await response.json();
      setServices(data.services);
    } catch (error) {
      console.error("Error fetching services:", error);
      showToast(t("favorites.servicesFetchFailed"), "error");
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
      errors.service_id = t("favorites.selectService");
    }

    if (!requestFormData.day_of_week) {
      errors.day_of_week = t("favorites.selectDay");
    }

    if (!requestFormData.time_of_day) {
      errors.time_of_day = t("favorites.selectTime");
    }

    if (!requestFormData.details.trim()) {
      errors.details = t("favorites.provideDetails");
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
        showToast(t("common.loginAgain"), "error");
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
        throw new Error(errorData.message || t("favorites.requestFailed"));
      }

      showToast(t("favorites.requestSubmitted"), "success");
      setShowRequestModal(false);
    } catch (error) {
      console.error("Error submitting help request:", error);
      showToast(
        error instanceof Error ? error.message : t("favorites.requestFailed"),
        "error"
      );
    } finally {
      setIsSubmittingRequest(false);
    }
  };


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
        showToast(t("common.loginAgain"), "error");
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
        throw new Error(t("favorites.reviewsFetchFailed"));
      }

      const data = await response.json();
      setReviews(data.reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      showToast(t("favorites.reviewsFetchFailed"), "error");
    } finally {
      setIsLoadingReviews(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-rose-600" />
          <p className="mt-4 text-lg font-medium text-gray-700">
            {t("favorites.loading")}
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
            {t("favorites.title")}
          </h1>
          <p className="text-gray-500">{t("favorites.subtitle")}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="relative">
            <Search
              className={`absolute ${
                isRTL ? "right-3" : "left-3"
              } top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5`}
            />
            <Input
              placeholder={t("favorites.searchPlaceholder")}
              className={`${
                isRTL ? "pr-10" : "pl-10"
              } py-6 bg-gray-50 border-gray-100 rounded-xl`}
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
              {searchTerm
                ? t("favorites.noMatchingFavorites")
                : t("favorites.noFavorites")}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {searchTerm
                ? t("favorites.noMatchingFavoritesMessage")
                : t("favorites.noFavoritesMessage")}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                className="border-rose-200 text-rose-700 hover:bg-rose-50"
                onClick={() => setSearchTerm("")}
              >
                {t("favorites.clearSearch")}
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
                        ({volunteer.review_count} {t("favorites.reviews")})
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{volunteer.city}</p>
                  </div>
                </CardContent>
                <CardContent>
                  <p className="text-sm text-gray-700">{volunteer.bio}</p>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-800">
                      {t("favorites.services")}
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
                      {t("favorites.availability")}
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
                    {t("favorites.reviews")}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700"
                    onClick={() => openRequestModal(volunteer)}
                  >
                    {t("favorites.requestHelp")}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
     
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("favorites.requestHelp")}</DialogTitle>
            <DialogDescription>
              {t("favorites.requestHelpDescription", {
                name: `${requestVolunteer?.first_name} ${requestVolunteer?.last_name}`,
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
 
            <div className="space-y-2">
              <Label htmlFor="service">
                {t("favorites.serviceType")}{" "}
                <span className="text-rose-500">*</span>
              </Label>
              {isLoadingServices ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                  <span className="text-sm text-gray-500">
                    {t("favorites.loadingServices")}
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
                    <SelectValue placeholder={t("favorites.selectService")} />
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


            <div className="space-y-2">
              <Label htmlFor="day_of_week">
                {t("favorites.dayOfWeek")}{" "}
                <span className="text-rose-500">*</span>
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
                  <SelectValue placeholder={t("favorites.selectDay")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">{t("days.monday")}</SelectItem>
                  <SelectItem value="tuesday">{t("days.tuesday")}</SelectItem>
                  <SelectItem value="wednesday">
                    {t("days.wednesday")}
                  </SelectItem>
                  <SelectItem value="thursday">{t("days.thursday")}</SelectItem>
                  <SelectItem value="friday">{t("days.friday")}</SelectItem>
                  <SelectItem value="saturday">{t("days.saturday")}</SelectItem>
                  <SelectItem value="sunday">{t("days.sunday")}</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.day_of_week && (
                <p className="text-sm text-rose-500 flex items-center mt-1">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {formErrors.day_of_week}
                </p>
              )}
            </div>

      
            <div className="space-y-2">
              <Label htmlFor="time_of_day">
                {t("favorites.timeOfDay")}{" "}
                <span className="text-rose-500">*</span>
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
                  <SelectValue placeholder={t("favorites.selectTime")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">
                    {t("timeOfDay.morning")}
                  </SelectItem>
                  <SelectItem value="afternoon">
                    {t("timeOfDay.afternoon")}
                  </SelectItem>
                  <SelectItem value="evening">
                    {t("timeOfDay.evening")}
                  </SelectItem>
                </SelectContent>
              </Select>
              {formErrors.time_of_day && (
                <p className="text-sm text-rose-500 flex items-center mt-1">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {formErrors.time_of_day}
                </p>
              )}
            </div>

    
            <div className="space-y-2">
              <Label htmlFor="details">
                {t("favorites.details")}{" "}
                <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="details"
                placeholder={t("favorites.detailsPlaceholder")}
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
                {t("favorites.urgent")}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRequestModal(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={submitHelpRequest}
              className="bg-rose-600 hover:bg-rose-700"
              disabled={isSubmittingRequest}
            >
              {isSubmittingRequest ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("favorites.submitting")}
                </>
              ) : (
                t("favorites.submitRequest")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReviewsModal} onOpenChange={setShowReviewsModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              {t("favorites.reviewsFor", {
                name: `${selectedVolunteer?.first_name} ${selectedVolunteer?.last_name}`,
              })}
            </DialogTitle>
            <DialogDescription>
              {selectedVolunteer?.review_count}{" "}
              {t("favorites.reviewsWithRating", {
                rating: selectedVolunteer?.rating
                  ? Number.parseFloat(selectedVolunteer.rating).toFixed(1)
                  : "0",
              })}
            </DialogDescription>
          </DialogHeader>

          {isLoadingReviews ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-rose-500 mr-2" />
              <p>{t("favorites.loadingReviews")}</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{t("favorites.noReviews")}</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
