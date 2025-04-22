import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserData } from "../contexts/UserContext";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Heart, UserCog } from "lucide-react";
import { cn } from "../lib/utils";

interface RoleSwitcherProps {
  variant?: "compact" | "full";
  className?: string;
}

export default function RoleSwitcher({
  variant = "full",
  className,
}: RoleSwitcherProps) {
  const { t, i18n } = useTranslation();
  const { currentRole, toggleRole } = useUserData();
  const [isAnimating, setIsAnimating] = useState(false);

  const isRTL = i18n.language === "ar";

  const handleToggle = () => {
    setIsAnimating(true);
    toggleRole();
    setTimeout(() => setIsAnimating(false), 500);
  };


  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center",
          isRTL ? "flex-row-reverse" : "",
          className
        )}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex items-center space-x-2">
          <Switch
            id="role-mode"
            checked={currentRole === "volunteer"}
            onCheckedChange={handleToggle}
          />
          <Label
            htmlFor="role-mode"
            className={cn(
              "text-sm font-medium cursor-pointer",
              isRTL ? "mr-2" : "ml-2"
            )}
          >
            {currentRole === "elder" ? t("roles.elder") : t("roles.volunteer")}
          </Label>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-4 bg-white rounded-lg shadow-sm border border-gray-100",
        className
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-between">

        <div className={cn("flex flex-col space-y-1", isRTL && "text-right")}>
          <h3 className="text-sm font-medium text-gray-900">
            {t("roles.current")}
          </h3>
          <p className="text-xs text-gray-500">
            {t("roles.switchDescription")}
          </p>
        </div>


        <div className="flex items-center gap-3">
 
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all",
              currentRole === "elder"
                ? "bg-rose-50 text-rose-700"
                : "text-gray-500",
              isRTL && "flex-row-reverse"
            )}
          >
            <UserCog className="h-4 w-4" />
            <span className="text-sm font-medium">{t("roles.elder")}</span>
          </div>


          <Switch
            id="role-mode-full"
            checked={currentRole === "volunteer"}
            onCheckedChange={handleToggle}
            className={isAnimating ? "animate-pulse" : ""}
          />

          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all",
              currentRole === "volunteer"
                ? "bg-rose-50 text-rose-700"
                : "text-gray-500",
              isRTL && "flex-row-reverse"
            )}
          >
            <Heart className="h-4 w-4" />
            <span className="text-sm font-medium">{t("roles.volunteer")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
