"use client";

import { useState, useEffect } from "react";
import { useUserData } from "../contexts/UserContext";
import { Star, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Review {
  rating: number;
  comment: string;
  elder_first_name: string;
  elder_last_name: string;
  created_at: string;
}

export default function Reviews() {
  const { userData, currentRole } = useUserData();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userData?.id || currentRole !== "volunteer") {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `http://localhost:5000/api/user/${userData.id}/reviews`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
        } else {
          setError("Failed to fetch reviews");
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("An error occurred while fetching reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userData, currentRole]);

  if (currentRole !== "volunteer") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <div className="bg-rose-100 rounded-full p-6 mb-4">
          <Star className="h-10 w-10 text-rose-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Reviews are for volunteers
        </h2>
        <p className="text-gray-600 max-w-md">
          This section is only available for volunteer accounts. Switch to a
          volunteer account to view your reviews.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <div className="bg-red-50 rounded-full p-6 mb-4">
          <Star className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Reviews</h1>
        <p className="text-gray-600">
          See what elders are saying about your services and assistance.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <div className="bg-rose-100 rounded-full p-4 mx-auto w-fit mb-4">
            <Star className="h-8 w-8 text-rose-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No reviews yet
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            You haven't received any reviews yet. Keep providing great service,
            and the reviews will come!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 transition-all hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-gray-700 font-medium">
                      {review.rating}/5
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    From {review.elder_first_name} {review.elder_last_name} •{" "}
                    {formatDistanceToNow(new Date(review.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                <p className="text-gray-800 italic">"{review.comment}"</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
