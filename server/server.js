import express from "express";
import * as authController from "./controllers/authController.js";
import * as userController from "./controllers/userController.js";
import * as serviceController from "./controllers/serviceController.js";
import * as volunteerController from "./controllers/volunteerController.js";
import * as reviewController from "./controllers/reviewController.js";
import * as favoriteController from "./controllers/favoriteController.js";
import * as requestController from "./controllers/requestController.js";
import * as notificationController from "./controllers/notificationController.js";

import { authenticateUser } from "./middleware/authMiddleware.js";

import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

//-------------------------------------SERVER TESTING----------------------------------
app.get("/", (req, res) => {
  res.send("VillageCare Backend is running");
});
//-------------------------------------AUTH--------------------------------------------
app.post("/api/validate-token", authController.validateToken);
app.post("/api/auth/login", authController.login);
app.post("/api/auth/register", authController.register);
//-------------------------------------USER--------------------------------------------
app.get("/api/user", authenticateUser, userController.getUserData);
app.put("/api/user/update", authenticateUser, userController.updateUserInfo);
app.patch("/api/user/role", authenticateUser, userController.updateUserRole);
app.put("/api/user/password", authenticateUser, userController.updatePassword);
//-------------------------------------SERVICES----------------------------------------
app.get("/api/user/services", authenticateUser, serviceController.getServices);
app.put(
  "/api/user/services/update",
  authenticateUser,
  serviceController.updateUserServices
);
app.get(
  "/api/user/availabilities",
  authenticateUser,
  serviceController.getUserAvailability
);
app.put(
  "/api/user/availabilities/update",
  authenticateUser,
  serviceController.updateUserAvailability
);
//-------------------------------------VOLUNTEERS--------------------------------------
app.get(
  "/api/volunteers",
  authenticateUser,
  volunteerController.getAllVolunteers
);
app.get(
  "/api/volunteers/match",
  authenticateUser,
  volunteerController.getVolunteerMatches
);
//-------------------------------------REVIEWS--------------------------------------
app.get(
  "/api/user/:volunteerId/reviews",
  authenticateUser,
  reviewController.getReviewsForVolunteer
);
app.post("/api/reviews/new", authenticateUser, reviewController.addReview);
//-------------------------------------FAVORITES--------------------------------------
app.get("/api/favorites", authenticateUser, favoriteController.getFavorites);
app.get(
  "/api/favorites/:volunteerId/check",
  authenticateUser,
  favoriteController.isFavoriteVolunteer
);
app.post(
  "/api/favorites/add",
  authenticateUser,
  favoriteController.addFavorite
);
app.delete(
  "/api/favorites/:volunteerId/remove",
  authenticateUser,
  favoriteController.removeFavorite
);
//-------------------------------------REQUESTS--------------------------------------
app.post(
  "/api/requests/new",
  authenticateUser,
  requestController.createRequest
);
app.get(
  "/api/requests/elder",
  authenticateUser,
  requestController.getElderRequests
);
app.get(
  "/api/requests/volunteer",
  authenticateUser,
  requestController.getVolunteerRequests
);
app.patch(
  "/api/requests/:requestId/status",
  authenticateUser,
  requestController.updateRequestStatus
);
//-------------------------------------NOTIFICATIONS--------------------------------------
app.get(
  "/api/notifications",
  authenticateUser,
  notificationController.getUserNotifications
);
app.get(
  "/api/notifications/unread",
  authenticateUser,
  notificationController.getUnreadNotifications
);
app.patch(
  "/api/notifications/:notificationId/mark-as-read",
  authenticateUser,
  notificationController.markNotificationAsRead
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
