import { useState } from "react";
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
  const { currentRole, toggleRole } = useUserData();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleRole();
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Switch
          id="role-mode"
          checked={currentRole === "volunteer"}
          onCheckedChange={handleToggle}
        />
        <Label
          htmlFor="role-mode"
          className="text-sm font-medium cursor-pointer"
        >
          {currentRole === "elder" ? "Elder" : "Volunteer"}
        </Label>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-4 bg-white rounded-lg shadow-sm border border-gray-100",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          <h3 className="text-sm font-medium text-gray-900">Current Role</h3>
          <p className="text-xs text-gray-500">
            Switch between elder and volunteer mode
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div
            className={cn(
              "flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all",
              currentRole === "elder"
                ? "bg-rose-50 text-rose-700"
                : "text-gray-500"
            )}
          >
            <UserCog className="h-4 w-4" />
            <span className="text-sm font-medium">Elder</span>
          </div>
          <Switch
            id="role-mode-full"
            checked={currentRole === "volunteer"}
            onCheckedChange={handleToggle}
            className={isAnimating ? "animate-pulse" : ""}
          />
          <div
            className={cn(
              "flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all",
              currentRole === "volunteer"
                ? "bg-rose-50 text-rose-700"
                : "text-gray-500"
            )}
          >
            <Heart className="h-4 w-4" />
            <span className="text-sm font-medium">Volunteer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
