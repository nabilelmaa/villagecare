"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "../components/ui/badge";
import {
  Clock,
  MessageCircle,
  Star,
  Filter,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { useUserData } from "../contexts/UserContext";
import { useToast } from "../contexts/ToastContext";

interface ApiRequest {
  id: number;
  day_of_week: string;
  time_of_day: string;
  details: string;
  urgent: boolean;
  service_id: number;
  service_name: string;
  elder_first_name: string;
  elder_last_name: string;
  elder_profile_image_url: string | null;
  volunteer_first_name: string;
  volunteer_last_name: string;
  volunteer_profile_image_url: string | null;
  volunteer_rating: string;
  volunteer_review_count: number;
  status?: string;
}

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ApiRequest[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<number | null>(null);

  const { userData, currentRole } = useUserData();
  const { showToast } = useToast();

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        return;
      }

      const endpoint =
        currentRole === "elder"
          ? "http://localhost:5000/api/requests/elder"
          : "http://localhost:5000/api/requests/volunteer";

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }

      const data = await response.json();

      // Set default status to "pending" if not provided
      const requestsWithStatus = (data.requests || []).map(
        (req: ApiRequest) => ({
          ...req,
          status: req.status || "pending",
        })
      );

      setRequests(requestsWithStatus);
      setFilteredRequests(requestsWithStatus);
    } catch (error) {
      console.error("Error fetching requests:", error);
      showToast("Failed to load requests", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: number, status: string) => {
    setIsUpdatingStatus(requestId);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Please log in again", "error");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/requests/${requestId}/status`,
        {
          method: "PATCH", // Using PATCH as specified
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update request status");
      }

      // Get status verb for toast message
      let statusVerb = "";
      switch (status) {
        case "accepted":
          statusVerb = "accepted";
          break;
        case "rejected":
          statusVerb = "rejected";
          break;
        case "completed":
          statusVerb = "completed";
          break;
        case "canceled":
          statusVerb = "canceled";
          break;
        default:
          statusVerb = "updated";
      }

      showToast(`Request ${statusVerb} successfully`, "success");

      // Update local state
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === requestId ? { ...req, status } : req
        )
      );

      // Refresh requests to get the latest data
      fetchRequests();
    } catch (error) {
      console.error("Error updating request status:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "An error occurred while updating the request",
        "error"
      );
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.service_name.toLowerCase().includes(term) ||
          req.details.toLowerCase().includes(term) ||
          `${req.elder_first_name} ${req.elder_last_name}`
            .toLowerCase()
            .includes(term) ||
          `${req.volunteer_first_name} ${req.volunteer_last_name}`
            .toLowerCase()
            .includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // Filter by tab
    if (activeTab === "pending") {
      filtered = filtered.filter((req) => req.status === "pending");
    } else if (activeTab === "active") {
      filtered = filtered.filter((req) => req.status === "accepted");
    } else if (activeTab === "completed") {
      filtered = filtered.filter((req) => req.status === "completed");
    }

    setFilteredRequests(filtered);
  };

  // Fetch requests on component mount
  useEffect(() => {
    fetchRequests();
  }, [currentRole]);

  // Apply filters when search term, status filter, or active tab changes
  useEffect(() => {
    filterRequests();
  }, [searchTerm, statusFilter, activeTab, requests]);

  // Format day and time for display
  const formatDayAndTime = (day: string, time: string): string => {
    const formattedDay = day.charAt(0).toUpperCase() + day.slice(1);
    const formattedTime = time.charAt(0).toUpperCase() + time.slice(1);
    return `${formattedDay}s, ${formattedTime}`;
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "accepted":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      case "canceled":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-rose-600" />
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading requests...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Requests</h1>
            <p className="text-gray-500">
              {currentRole === "elder"
                ? "Manage your service requests"
                : "Manage help requests from elders"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by service, details, or name..."
                className="pl-10 py-6 bg-gray-50 border-gray-100 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl px-4"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5" />
              Filters
              {statusFilter !== "all" && (
                <Badge className="ml-2 bg-rose-100 text-rose-800 hover:bg-rose-200">
                  Active
                </Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-gray-50 border-gray-100">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
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
          <TabsList className="bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="all"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Pending
              <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                {requests.filter((r) => r.status === "pending").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Active
              <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                {requests.filter((r) => r.status === "accepted").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">No requests found.</p>
                  {currentRole === "elder" && (
                    <Button
                      className="bg-rose-600 hover:bg-rose-700"
                      onClick={() => (window.location.href = "/dashboard")}
                    >
                      Find Volunteers
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredRequests.map((request) => (
                  <Card
                    key={request.id}
                    className={`overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
                      request.urgent ? "border-l-4 border-l-rose-500" : ""
                    } ${
                      request.status === "accepted"
                        ? "border-green-500"
                        : request.status === "completed"
                        ? "border-blue-500"
                        : ""
                    }`}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center">
                            {request.service_name}
                            {request.urgent && (
                              <Badge className="ml-2 bg-rose-100 text-rose-800 hover:bg-rose-100 border border-rose-200">
                                Urgent
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {currentRole === "elder"
                              ? `Volunteer: ${request.volunteer_first_name} ${request.volunteer_last_name}`
                              : `Requested by: ${request.elder_first_name} ${request.elder_last_name}`}
                          </CardDescription>
                        </div>
                        <Badge
                          className={`px-3 py-1 rounded-lg ${getStatusBadgeClass(
                            request.status || "pending"
                          )}`}
                        >
                          {request.status
                            ? request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)
                            : "Pending"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDayAndTime(
                          request.day_of_week,
                          request.time_of_day
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{request.details}</p>
                      <div className="flex items-center space-x-4 mt-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              currentRole === "elder"
                                ? request.volunteer_profile_image_url ||
                                  "/placeholder.svg"
                                : request.elder_profile_image_url ||
                                  "/placeholder.svg"
                            }
                            alt={
                              currentRole === "elder"
                                ? `${request.volunteer_first_name} ${request.volunteer_last_name}`
                                : `${request.elder_first_name} ${request.elder_last_name}`
                            }
                          />
                          <AvatarFallback>
                            {currentRole === "elder"
                              ? `${request.volunteer_first_name.charAt(
                                  0
                                )}${request.volunteer_last_name.charAt(0)}`
                              : `${request.elder_first_name.charAt(
                                  0
                                )}${request.elder_last_name.charAt(0)}`}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {currentRole === "elder"
                              ? `${request.volunteer_first_name} ${request.volunteer_last_name}`
                              : `${request.elder_first_name} ${request.elder_last_name}`}
                          </p>
                          {currentRole === "elder" && (
                            <div className="flex items-center">
                              <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                              <p className="text-xs text-gray-500">
                                {request.volunteer_rating} (
                                {request.volunteer_review_count})
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                      {/* ELDER ACTIONS */}
                      {currentRole === "elder" && (
                        <>
                          {/* Elder can cancel pending or accepted requests */}
                          {(request.status === "pending" ||
                            request.status === "accepted") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                              onClick={() =>
                                updateRequestStatus(request.id, "canceled")
                              }
                              disabled={isUpdatingStatus === request.id}
                            >
                              {isUpdatingStatus === request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1.5" />
                              )}
                              Cancel
                            </Button>
                          )}

                          {/* Elder can mark accepted requests as completed */}
                          {request.status === "accepted" && (
                            <Button
                              size="sm"
                              className="rounded-lg bg-rose-600 hover:bg-rose-700"
                              onClick={() =>
                                updateRequestStatus(request.id, "completed")
                              }
                              disabled={isUpdatingStatus === request.id}
                            >
                              {isUpdatingStatus === request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1.5" />
                              )}
                              Mark as Completed
                            </Button>
                          )}
                        </>
                      )}

                      {/* VOLUNTEER ACTIONS */}
                      {currentRole === "volunteer" && (
                        <>
                          {/* Volunteer can accept or reject pending requests */}
                          {request.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg border-red-200 text-red-700 hover:bg-red-50"
                                onClick={() =>
                                  updateRequestStatus(request.id, "rejected")
                                }
                                disabled={isUpdatingStatus === request.id}
                              >
                                {isUpdatingStatus === request.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <XCircle className="h-4 w-4 mr-1.5" />
                                )}
                                Reject
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg border-green-200 text-green-700 hover:bg-green-50"
                                onClick={() =>
                                  updateRequestStatus(request.id, "accepted")
                                }
                                disabled={isUpdatingStatus === request.id}
                              >
                                {isUpdatingStatus === request.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1.5" />
                                )}
                                Accept
                              </Button>
                            </>
                          )}

                          {/* Volunteer can cancel accepted requests */}
                          {request.status === "accepted" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                              onClick={() =>
                                updateRequestStatus(request.id, "canceled")
                              }
                              disabled={isUpdatingStatus === request.id}
                            >
                              {isUpdatingStatus === request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1.5" />
                              )}
                              Cancel
                            </Button>
                          )}
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <MessageCircle className="h-4 w-4 mr-1.5" />
                        Message
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
