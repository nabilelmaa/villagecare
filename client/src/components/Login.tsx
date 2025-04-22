import type React from "react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { HeartHandshake, Loader2 } from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { useUserData } from "../contexts/UserContext";
import { useTranslation } from "react-i18next";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { fetchUserData } = useUserData();
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const isRTL = i18n.dir() === "rtl";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      login(data.token);

      await fetchUserData();

      // now redirect to dashboard
      const redirectUrl = sessionStorage.getItem("redirectUrl");
      const safeRedirectUrl =
        !redirectUrl || redirectUrl === "/auth/login" || redirectUrl === "/"
          ? "/dashboard"
          : redirectUrl;
      sessionStorage.removeItem("redirectUrl");
      navigate(safeRedirectUrl, { replace: true });

      showToast(t("auth.loginSuccess"), "success");
    } catch (err) {
      showToast(t("auth.invalidCredentials"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-rose-200 rounded-full opacity-20 blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-rose-300 rounded-full opacity-20 blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] bg-repeat opacity-5"></div>

      <Link to="/" className="flex items-center gap-2 mb-8 relative z-10">
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-rose-600 flex items-center justify-center transform rotate-6 shadow-lg">
          <HeartHandshake className="h-6 w-6 text-white transform -rotate-6" />
        </div>
        <span className="text-2xl font-bold tracking-tight">VillageCare</span>
      </Link>

      <Card className="w-full max-w-md relative z-10 overflow-hidden border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-white"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-full opacity-50 blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-100 rounded-full opacity-50 blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-rose-900">
              {t("auth.welcomeBack")}
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              {t("auth.enterCredentials")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  {t("auth.email")}
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`${
                      isRTL ? "pr-10" : "pl-10"
                    } bg-white/70 backdrop-blur-sm border-rose-100 focus:border-rose-300 focus:ring-rose-200`}
                  />
                  <div
                    className={`absolute ${
                      isRTL ? "right-3" : "left-3"
                    } top-1/2 transform -translate-y-1/2 text-gray-400`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700">
                    {t("auth.password")}
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-rose-600 hover:text-rose-800 hover:underline"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`${
                      isRTL ? "pr-10" : "pl-10"
                    } bg-white/70 backdrop-blur-sm border-rose-100 focus:border-rose-300 focus:ring-rose-200`}
                  />
                  <div
                    className={`absolute ${
                      isRTL ? "right-3" : "left-3"
                    } top-1/2 transform -translate-y-1/2 text-gray-400`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className={`absolute ${
                      isRTL ? "left-3" : "right-3"
                    } top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none`}
                    aria-label={
                      showPassword
                        ? t("auth.hidePassword")
                        : t("auth.showPassword")
                    }
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white py-6 text-sm rounded-xl shadow-lg shadow-rose-200/50 transition-all hover:shadow-xl hover:shadow-rose-300/50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("auth.signingIn")}
                  </>
                ) : (
                  t("auth.login")
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="relative flex items-center w-full py-5">
              <div className="flex-grow border-t border-gray-200"></div>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="text-sm text-center text-gray-500 mt-6">
              {t("auth.noAccount")}{" "}
              <Link
                to="/auth/register"
                className="text-rose-600 hover:text-rose-800 font-medium hover:underline"
              >
                {t("auth.signup")}
              </Link>
            </div>
          </CardFooter>
        </div>
      </Card>

      <p className="mt-8 text-center text-xs text-gray-500 max-w-md">
        {t("auth.termsNotice")}{" "}
        <Link to="#" className="text-rose-600 hover:underline">
          {t("settings.termsOfService")}
        </Link>{" "}
        {t("common.and")}{" "}
        <Link to="#" className="text-rose-600 hover:underline">
          {t("settings.privacyPolicy")}
        </Link>
        .
      </p>
    </div>
  );
};

export default LoginPage;
