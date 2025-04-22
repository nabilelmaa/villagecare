import type React from "react";

import { useState, useEffect, type FormEvent } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import {
  ChevronDown,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  XCircle,
  Loader2,
  Eye,
} from "lucide-react";
import { useUserData } from "../contexts/UserContext";
import RoleSwitcher from "../components/RoleSwitcher";
import { useToast } from "../contexts/ToastContext";
import type { Service, Availability } from "../types/index";

import { useTranslation } from "react-i18next";

const getLocalizedServiceName = (
  service: Service,
  language: string
): string => {
  if (language === "ar") return service.name_ar || service.name;
  if (language === "fr") return service.name_fr || service.name;
  return service.name_en || service.name;
};

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);

  const [activeTab, setActiveTab] = useState("personal");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingServices, setIsUpdatingServices] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    city: "",
    bio: "",
    gender: "",
  });

  const { userData, currentRole } = useUserData();
  const { showToast } = useToast();

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
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch services");
      }

      const data = await response.json();
      setServices(data.services);
    } catch (error) {
      console.error("Error fetching services:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to load services",
        "error"
      );
    } finally {
      setIsLoadingServices(false);
    }
  };

  const fetchAvailability = async () => {
    setIsLoadingAvailability(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/user/availabilities",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch availability");
      }

      const data = await response.json();
      setAvailability(data.availability);
    } catch (error) {
      console.error("Error fetching availability:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to load availability",
        "error"
      );
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const fetchElderPreferences = async () => {
    setIsLoadingServices(true);
    setIsLoadingAvailability(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        return;
      }

      const servicesResponse = await fetch(
        "http://localhost:5000/api/user/services",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!servicesResponse.ok) {
        const errorData = await servicesResponse.json();
        throw new Error(
          errorData.message || "Failed to fetch service preferences"
        );
      }

      const servicesData = await servicesResponse.json();
      setServices(servicesData.services);

      const availabilityResponse = await fetch(
        "http://localhost:5000/api/user/availabilities",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!availabilityResponse.ok) {
        const errorData = await availabilityResponse.json();
        throw new Error(
          errorData.message || "Failed to fetch availability preferences"
        );
      }

      const availabilityData = await availabilityResponse.json();
      setAvailability(availabilityData.availability);
    } catch (error) {
      console.error("Error fetching elder preferences:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to load preferences",
        "error"
      );
    } finally {
      setIsLoadingServices(false);
      setIsLoadingAvailability(false);
    }
  };

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        phone_number: userData.phone_number || "",
        city: userData.city || "",
        bio: userData.bio || "",
        gender: userData.gender || "",
      });
    }
    if (currentRole === "volunteer") {
      fetchServices();
      fetchAvailability();
    }
    if (currentRole === "elder") {
      fetchElderPreferences();
    }
  }, [userData, currentRole]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceChange = (serviceId: number, checked: boolean) => {
    setServices((prevServices) =>
      prevServices.map((service) =>
        service.id === serviceId ? { ...service, selected: checked } : service
      )
    );
  };

  const handleAvailabilityChange = (
    day: string,
    time: string,
    checked: boolean
  ) => {
    setAvailability((prevAvailability) =>
      prevAvailability.map((slot) =>
        slot.day_of_week === day && slot.time_of_day === time
          ? { ...slot, selected: checked }
          : slot
      )
    );
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (
      name === "confirmPassword" ||
      (name === "newPassword" && passwordData.confirmPassword)
    ) {
      if (name === "newPassword" && value !== passwordData.confirmPassword) {
        setPasswordErrors((prev) => ({
          ...prev,
          confirmPassword: t("profile.passDontMatch"),
        }));
      } else if (
        name === "confirmPassword" &&
        value !== passwordData.newPassword
      ) {
        setPasswordErrors((prev) => ({
          ...prev,
          confirmPassword: t("profile.passDontMatch"),
        }));
      } else {
        setPasswordErrors((prev) => ({
          ...prev,
          confirmPassword: "",
        }));
      }
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();

    let hasErrors = false;
    const newErrors = { ...passwordErrors };

    if (!passwordData.oldPassword) {
      newErrors.oldPassword = t("profile.currentPassRequired");
      hasErrors = true;
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = t("profile.newPassRequired");
      hasErrors = true;
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = t("profile.passMustBe");
      hasErrors = true;
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = t("profile.pleaseConfirmPass");
      hasErrors = true;
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = t("profile.passDontMatch");
      hasErrors = true;
    }

    if (hasErrors) {
      setPasswordErrors(newErrors);
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        setIsUpdatingPassword(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordData.oldPassword,
          new_password: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update password");
      }

      showToast(t("profile.passwordUpdated"), "success");

      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to update password",
        "error"
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUpdateElderPreferences = async () => {
    setIsUpdatingServices(true);
    setIsUpdatingAvailability(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        return;
      }
      const servicesResponse = await fetch(
        "http://localhost:5000/api/user/services/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            services: services.map((service) => ({
              service_id: service.id,
              selected: service.selected,
            })),
          }),
        }
      );

      if (!servicesResponse.ok) {
        const errorData = await servicesResponse.json();
        throw new Error(
          errorData.message || "Failed to update service preferences"
        );
      }

      const availabilityResponse = await fetch(
        "http://localhost:5000/api/user/availabilities/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ availability }),
        }
      );

      if (!availabilityResponse.ok) {
        const errorData = await availabilityResponse.json();
        throw new Error(
          errorData.message || "Failed to update availability preferences"
        );
      }

      showToast(t("profile.preferencesUpdated"), "success");
    } catch (error) {
      console.error("Error updating elder preferences:", error);
      showToast(t("profile.preferencesNotUpdated"), "error");
    } finally {
      setIsUpdatingServices(false);
      setIsUpdatingAvailability(false);
    }
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        setIsUpdatingProfile(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      showToast(t("profile.profileUpdated"), "success");
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "An error occurred while updating your profile",
        "error"
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdateServices = async () => {
    setIsUpdatingServices(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        setIsUpdatingServices(false);
        return;
      }

      const servicesData = services.map((service) => ({
        service_id: service.id,
        selected: service.selected,
      }));

      const response = await fetch(
        "http://localhost:5000/api/user/services/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ services: servicesData }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update services");
      }

      showToast(t("profile.servicesUpdated"), "success");
      fetchServices();
    } catch (error) {
      console.error("Error updating services:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "An error occurred while updating your services",
        "error"
      );
    } finally {
      setIsUpdatingServices(false);
    }
  };

  const handleUpdateAvailability = async () => {
    setIsUpdatingAvailability(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        setIsUpdatingAvailability(false);
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/user/availabilities/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ availability }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update availability");
      }

      showToast(t("profile.availabilityUpdated"), "success");

      fetchAvailability();
    } catch (error) {
      console.error("Error updating availability:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "An error occurred while updating your availability",
        "error"
      );
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const weekdays = [
    { id: "monday", label: t("days.monday") },
    { id: "tuesday", label: t("days.tuesday") },
    { id: "wednesday", label: t("days.wednesday") },
    { id: "thursday", label: t("days.thursday") },
    { id: "friday", label: t("days.friday") },
    { id: "saturday", label: t("days.saturday") },
    { id: "sunday", label: t("days.sunday") },
  ];

  const timeSlots = [
    { id: "morning", label: t("timeOfDay.morning") },
    { id: "afternoon", label: t("timeOfDay.afternoon") },
    { id: "evening", label: t("timeOfDay.evening") },
  ];

  const isAvailable = (day: string, time: string): boolean => {
    const slot = availability.find(
      (a) => a.day_of_week === day && a.time_of_day === time
    );
    return slot ? slot.selected : false;
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
      <div className="mb-6 sm:mb-8">
        <RoleSwitcher />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="lg:w-1/3">
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <div
              className={`h-24 sm:h-32 relative ${
                currentRole === "elder"
                  ? "bg-gradient-to-r from-blue-500 to-blue-400"
                  : "bg-gradient-to-r from-rose-500 to-rose-400"
              }`}
            ></div>
            <div className="px-4 sm:px-6 pb-6">
              <div className="flex justify-center">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow-lg -mt-10 sm:-mt-12">
                  <AvatarImage
                    src={
                      userData?.profile_image_url ||
                      "/placeholder.svg?height=100&width=100" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={userData?.first_name}
                  />
                  <AvatarFallback
                    className={`text-xl ${
                      currentRole === "elder"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {userData?.first_name ? userData.first_name.charAt(0) : "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center mt-3 sm:mt-4">
                <h2 className="text-lg sm:text-xl font-bold">
                  {userData?.first_name} {userData?.last_name}
                </h2>
                <p className="text-sm text-gray-500 flex items-center justify-center mt-1">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                  {userData?.city
                    ? userData.city.charAt(0).toUpperCase() +
                      userData.city.slice(1)
                    : "No city provided"}
                </p>
                <div className="flex justify-center mt-2">
                  <Badge
                    className={`text-xs sm:text-sm ${
                      currentRole === "elder"
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {currentRole === "elder" ? "Elder" : "Volunteer"}
                  </Badge>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 space-y-3 sm:space-y-4">
                <div className="flex items-start">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t("profile.phone")}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {userData?.phone_number || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t("profile.email")}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {userData?.email || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t("profile.address")}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {userData?.city
                        ? userData.city.charAt(0).toUpperCase() +
                          userData.city.slice(1)
                        : "No city provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t("profile.memberSince")}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {userData?.created_at
                        ? new Date(userData.created_at).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              {currentRole === "volunteer" && (
                <div className="mt-5 sm:mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900">
                      {t("profile.servicesOffered")}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {isLoadingServices ? (
                      <div className="flex items-center text-gray-500">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading services...
                      </div>
                    ) : services.filter((s) => s.selected).length > 0 ? (
                      services
                        .filter((service) => service.selected)
                        .map((service) => (
                          <Badge
                            key={service.id}
                            variant="outline"
                            className="bg-gray-50"
                          >
                            {getLocalizedServiceName(service, currentLanguage)}
                          </Badge>
                        ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        {t("profile.noServicesSelected")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex justify-center items-center">
                  <div>
                    <p
                      className={`text-2xl font-bold ${
                        currentRole === "elder"
                          ? "text-blue-600"
                          : "text-rose-600"
                      }`}
                    ></p>
                  </div>
                  {currentRole === "volunteer" && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {t("profile.rating")}
                      </p>
                      <p className="text-2xl font-bold text-rose-600">
                        {userData?.rating
                          ? Number(userData.rating).toFixed(1)
                          : "0.0"}
                        /5 ({userData?.review_count || 0})
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:w-2/3">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 sm:grid-cols-4 mb-6 sm:mb-8">
              <TabsTrigger
                value="personal"
                className={`text-xs sm:text-sm py-1.5 sm:py-2 data-[state=active]:${
                  currentRole === "elder"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {t("profile.personalInfo")}
              </TabsTrigger>

              {currentRole === "volunteer" && (
                <TabsTrigger
                  value="availability"
                  className="text-xs sm:text-sm py-1.5 sm:py-2 data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700"
                >
                  {t("profile.availability")}
                </TabsTrigger>
              )}

              {currentRole === "elder" && (
                <TabsTrigger
                  value="preferences"
                  className="text-xs sm:text-sm py-1.5 sm:py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  {t("profile.preferences")}
                </TabsTrigger>
              )}

              <TabsTrigger
                value="security"
                className={`text-xs sm:text-sm py-1.5 sm:py-2 data-[state=active]:${
                  currentRole === "elder"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {t("profile.security")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card className="border-0 shadow-md rounded-xl">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">
                    {t("profile.personalInfo")}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {t("profile.updatePersonalDetails")}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-5 sm:space-y-6">
                  <form onSubmit={handleUpdateProfile}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="first_name" className="text-sm">
                          {t("profile.firstName")}
                        </Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="last_name" className="text-sm">
                          {t("profile.lastName")}
                        </Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="email" className="text-sm">
                          {t("profile.email")}
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="phone_number" className="text-sm">
                          {t("profile.phone")}
                        </Label>
                        <Input
                          id="phone_number"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
                        <Label htmlFor="city" className="text-sm">
                          {t("profile.city")}
                        </Label>
                        <Input
                          id="city"
                          name="city"
                          value={
                            formData.city.charAt(0).toUpperCase() +
                            formData.city.slice(1)
                          }
                          onChange={handleInputChange}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="gender" className="text-sm">
                          {t("profile.gender")}
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between text-sm"
                              id="gender"
                            >
                              {formData.gender
                                ? formData.gender.charAt(0).toUpperCase() +
                                  formData.gender.slice(1)
                                : "Select gender"}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            <DropdownMenuLabel>
                              {t("profile.gender")}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  gender: "male",
                                }));
                              }}
                            >
                              {t("profile.male")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  gender: "female",
                                }));
                              }}
                            >
                              {t("profile.female")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2 mt-5 sm:mt-6">
                      <Label htmlFor="bio" className="text-sm">
                        {t("profile.bio")}
                      </Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex justify-end mt-5 sm:mt-6">
                      <Button
                        type="submit"
                        className={
                          currentRole === "elder"
                            ? "bg-blue-600 hover:bg-blue-700 text-sm"
                            : "bg-rose-600 hover:bg-rose-700 text-sm"
                        }
                        disabled={isUpdatingProfile}
                      >
                        {isUpdatingProfile ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("common.updating")}
                          </>
                        ) : (
                          t("profile.updateProfile")
                        )}
                      </Button>
                    </div>
                  </form>

                  {currentRole === "volunteer" && (
                    <>
                      <div className="border-t border-gray-100 my-6 pt-6">
                        <div className="space-y-1.5 sm:space-y-2">
                          <Label className="text-lg font-medium">
                            {t("profile.servicesYouOffer")}
                          </Label>
                          <p className="text-sm text-gray-500 mb-4">
                            {t("profile.selectServicesVolunteer")}
                          </p>

                          {isLoadingServices ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-6 w-6 mr-2 animate-spin text-rose-500" />
                              <p>Loading services...</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                              {services.map((service) => (
                                <div
                                  key={service.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Switch
                                    id={`service-${service.id}`}
                                    checked={service.selected}
                                    onCheckedChange={(checked) =>
                                      handleServiceChange(service.id, checked)
                                    }
                                  />
                                  <Label
                                    htmlFor={`service-${service.id}`}
                                    className="text-sm"
                                  >
                                    {getLocalizedServiceName(
                                      service,
                                      currentLanguage
                                    )}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end mt-6">
                          <Button
                            type="button"
                            onClick={handleUpdateServices}
                            className="bg-rose-600 hover:bg-rose-700 text-sm"
                            disabled={isUpdatingServices || isLoadingServices}
                          >
                            {isUpdatingServices ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("profile.savingServices")}
                              </>
                            ) : (
                              t("profile.saveServices")
                            )}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            {currentRole === "volunteer" && (
              <TabsContent value="availability">
                <Card className="border-0 shadow-md rounded-xl">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl">
                      {t("profile.availability")}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {t("profile.setAvailability")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    {isLoadingAvailability ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 mr-2 animate-spin text-rose-500" />
                        <p>Loading availability...</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {weekdays.map((day) => (
                          <div
                            key={day.id}
                            className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                          >
                            <h3 className="font-medium text-gray-900 mb-3">
                              {day.label}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                              {timeSlots.map((slot) => (
                                <div
                                  key={slot.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Switch
                                    id={`${day.id}-${slot.id}`}
                                    checked={isAvailable(day.id, slot.id)}
                                    onCheckedChange={(checked) =>
                                      handleAvailabilityChange(
                                        day.id,
                                        slot.id,
                                        checked
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`${day.id}-${slot.id}`}
                                    className="text-xs sm:text-sm flex items-center"
                                  >
                                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-gray-400" />
                                    {slot.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end p-4 sm:p-6">
                    <Button
                      className="bg-rose-600 hover:bg-rose-700 text-sm"
                      onClick={handleUpdateAvailability}
                      disabled={isUpdatingAvailability || isLoadingAvailability}
                    >
                      {isUpdatingAvailability ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("common.updating")}
                        </>
                      ) : (
                        t("profile.saveSchedule")
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            )}

            {currentRole === "elder" && (
              <TabsContent value="preferences">
                <Card className="border-0 shadow-md rounded-xl">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl">
                      {t("profile.servicePreferences")}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {t("profile.selectServicesAndAvailability")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          {t("profile.servicesYouNeed")}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {t("profile.selectServicesElder")}
                        </p>

                        {isLoadingServices ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 mr-2 animate-spin text-blue-500" />
                            <p>Loading services...</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                            {services.map((service) => (
                              <div
                                key={service.id}
                                className="flex items-center space-x-2"
                              >
                                <Switch
                                  id={`service-${service.id}`}
                                  checked={service.selected}
                                  onCheckedChange={(checked) =>
                                    handleServiceChange(service.id, checked)
                                  }
                                />
                                <Label
                                  htmlFor={`service-${service.id}`}
                                  className="text-sm"
                                >
                                  {getLocalizedServiceName(
                                    service,
                                    currentLanguage
                                  )}
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-6 space-y-4">
                        <h3 className="text-lg font-medium">
                          {t("profile.yourAvailability")}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {t("profile.selectTimesForHelp")}
                        </p>

                        {isLoadingAvailability ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 mr-2 animate-spin text-blue-500" />
                            <p>Loading availability...</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {weekdays.map((day) => (
                              <div
                                key={day.id}
                                className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                              >
                                <h3 className="font-medium text-gray-900 mb-3">
                                  {day.label}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                                  {timeSlots.map((slot) => (
                                    <div
                                      key={slot.id}
                                      className="flex items-center space-x-2"
                                    >
                                      <Switch
                                        id={`${day.id}-${slot.id}`}
                                        checked={isAvailable(day.id, slot.id)}
                                        onCheckedChange={(checked) =>
                                          handleAvailabilityChange(
                                            day.id,
                                            slot.id,
                                            checked
                                          )
                                        }
                                      />
                                      <Label
                                        htmlFor={`${day.id}-${slot.id}`}
                                        className="text-xs sm:text-sm flex items-center"
                                      >
                                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-gray-400" />
                                        {slot.label}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end p-4 sm:p-6">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-sm"
                      onClick={handleUpdateElderPreferences}
                      disabled={
                        isUpdatingServices ||
                        isLoadingServices ||
                        isUpdatingAvailability ||
                        isLoadingAvailability
                      }
                    >
                      {isUpdatingServices || isUpdatingAvailability ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("common.updating")}
                        </>
                      ) : (
                        t("profile.savePreferences")
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="security">
              <Card className="border-0 shadow-md rounded-xl">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">
                    {t("profile.securitySettings")}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {t("profile.updatePasswordAndSecurity")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <form onSubmit={handleUpdatePassword}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="oldPassword" className="text-sm">
                          {t("profile.currentPassword")}
                        </Label>
                        <div className="relative">
                          <Input
                            id="oldPassword"
                            name="oldPassword"
                            type={
                              showPasswords.oldPassword ? "text" : "password"
                            }
                            value={passwordData.oldPassword}
                            onChange={handlePasswordChange}
                            className={
                              passwordErrors.oldPassword
                                ? "border-red-500"
                                : "text-sm"
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              togglePasswordVisibility("oldPassword")
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.oldPassword ? (
                              <XCircle className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {passwordErrors.oldPassword && (
                          <p className="text-sm text-red-500 mt-1">
                            {passwordErrors.oldPassword}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm">
                          {t("profile.newPassword")}
                        </Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type={
                              showPasswords.newPassword ? "text" : "password"
                            }
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className={
                              passwordErrors.newPassword
                                ? "border-red-500"
                                : "text-sm"
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              togglePasswordVisibility("newPassword")
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.newPassword ? (
                              <XCircle className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {passwordErrors.newPassword && (
                          <p className="text-sm text-red-500 mt-1">
                            {passwordErrors.newPassword}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm">
                          {t("profile.confirmNewPassword")}
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={
                              showPasswords.confirmPassword
                                ? "text"
                                : "password"
                            }
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className={
                              passwordErrors.confirmPassword
                                ? "border-red-500"
                                : "text-sm"
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              togglePasswordVisibility("confirmPassword")
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.confirmPassword ? (
                              <XCircle className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {passwordErrors.confirmPassword && (
                          <p className="text-sm text-red-500 mt-1">
                            {passwordErrors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        type="submit"
                        className={
                          currentRole === "elder"
                            ? "bg-blue-600 hover:bg-blue-700 text-sm"
                            : "bg-rose-600 hover:bg-rose-700 text-sm"
                        }
                        disabled={isUpdatingPassword}
                      >
                        {isUpdatingPassword ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("common.updating")}
                          </>
                        ) : (
                          t("profile.updatePassword")
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
