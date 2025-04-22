import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../i18n";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "default" | "compact" | "elegant";
}

export default function LanguageSwitcher({
  variant = "default",
}: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [animateSelection, setAnimateSelection] = useState("");

  const currentLanguage = i18n.language;

  const languages = [
    { code: "en", name: t("languages.english"), flagImg: "en.png" },
    { code: "fr", name: t("languages.french"), flagImg: "fr.png" },
    { code: "ar", name: t("languages.arabic"), flagImg: "ar.png" },
  ];

  const handleLanguageChange = (languageCode: string) => {
    setAnimateSelection(languageCode);
    setTimeout(() => {
      changeLanguage(languageCode);
      setOpen(false);
    }, 300);
  };

  const getCurrentLanguageFlag = () => {
    return (
      languages.find((lang) => lang.code === currentLanguage)?.flagImg ||
      "en.png"
    );
  };

  useEffect(() => {
    if (animateSelection) {
      const timer = setTimeout(() => {
        setAnimateSelection("");
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [animateSelection]);

  if (variant === "elegant") {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-full px-4 py-2 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 shadow-sm"
          >
            {/* <Globe className="h-4 w-4 text-indigo-600" /> */}
            <img
              src={getCurrentLanguageFlag()}
              alt={currentLanguage}
              className="h-5 w-5 rounded-sm object-cover"
            />
            <span className="font-medium text-gray-700">
              {languages.find((lang) => lang.code === currentLanguage)?.name}
            </span>
            <ChevronDown
              className={`h-4 w-4 ml-1 text-gray-500 transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 p-1 rounded-lg shadow-lg border border-gray-100"
        >
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`flex items-center justify-between gap-3 py-3 px-3 my-1 rounded-md cursor-pointer transition-all duration-300 ${
                currentLanguage === language.code
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "hover:bg-gray-50"
              } ${
                animateSelection === language.code
                  ? "bg-indigo-100 scale-95"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={language.flagImg}
                  alt={language.code}
                  className="h-5 w-5 rounded-sm object-cover"
                />
                <span>{language.name}</span>
              </div>
              {currentLanguage === language.code && (
                <Check className="h-4 w-4 text-indigo-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === "compact") {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 px-3 py-1 h-8 rounded-md hover:bg-gray-100 transition-colors duration-200"
          >
            {/* <Globe className="h-4 w-4 text-gray-600" /> */}
            <img
              src={getCurrentLanguageFlag()}
              alt={currentLanguage}
              className="h-4 w-4 rounded-sm object-cover"
            />
            <ChevronDown
              className={`h-3 w-3 text-gray-500 transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-44 p-1 rounded-md shadow-md border border-gray-100"
        >
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`flex items-center justify-between gap-2 py-2 px-2 my-0.5 rounded cursor-pointer transition-all duration-200 ${
                currentLanguage === language.code
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "hover:bg-gray-50"
              } ${
                animateSelection === language.code
                  ? "bg-indigo-100 scale-95"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <img
                  src={language.flagImg}
                  alt={language.code}
                  className="h-4 w-4 rounded-sm object-cover"
                />
                <span className="text-sm">{language.name}</span>
              </div>
              {currentLanguage === language.code && (
                <Check className="h-3 w-3 text-indigo-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 shadow-sm"
        >
          {/* <Globe className="h-4 w-4 text-indigo-600" /> */}
          <img
            src={getCurrentLanguageFlag()}
            alt={currentLanguage}
            className="h-5 w-5 rounded-sm object-cover"
          />
          <span className="font-medium text-gray-800">
            {languages.find((lang) => lang.code === currentLanguage)?.name}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52 p-1 rounded-md shadow-md border border-gray-100"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center justify-between gap-3 py-2.5 px-3 my-1 rounded-md cursor-pointer transition-all duration-300 ${
              currentLanguage === language.code
                ? "bg-indigo-50 text-indigo-700 font-medium"
                : "hover:bg-gray-50"
            } ${
              animateSelection === language.code ? "bg-indigo-100 scale-95" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <img
                src={language.flagImg}
                alt={language.code}
                className="h-5 w-5 rounded-sm object-cover"
              />
              <span>{language.name}</span>
            </div>
            {currentLanguage === language.code && (
              <Check className="h-4 w-4 text-indigo-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
