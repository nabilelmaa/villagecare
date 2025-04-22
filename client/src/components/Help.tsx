import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "../lib/utils";

export default function HelpPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    "general"
  );
  const [expandedQuestions, setExpandedQuestions] = useState<
    Record<string, boolean>
  >({});

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions({
      ...expandedQuestions,
      [questionId]: !expandedQuestions[questionId],
    });
  };

  const faqCategories = [
    {
      id: "general",
      title: t("help.faq.categories.general"),
      questions: [
        {
          id: "what-is-villagecare",
          question: t("help.faq.questions.whatIsVillageCare"),
          answer: t("help.faq.answers.whatIsVillageCare"),
        },
        {
          id: "how-to-get-started",
          question: t("help.faq.questions.howToGetStarted"),
          answer: t("help.faq.answers.howToGetStarted"),
        },
        {
          id: "is-service-free",
          question: t("help.faq.questions.isServiceFree"),
          answer: t("help.faq.answers.isServiceFree"),
        },
      ],
    },
    {
      id: "account",
      title: t("help.faq.categories.account"),
      questions: [
        {
          id: "create-account",
          question: t("help.faq.questions.createAccount"),
          answer: t("help.faq.answers.createAccount"),
        },
        {
          id: "forgot-password",
          question: t("help.faq.questions.forgotPassword"),
          answer: t("help.faq.answers.forgotPassword"),
        },
        {
          id: "change-email",
          question: t("help.faq.questions.changeEmail"),
          answer: t("help.faq.answers.changeEmail"),
        },
      ],
    },
    {
      id: "services",
      title: t("help.faq.categories.services"),
      questions: [
        {
          id: "available-services",
          question: t("help.faq.questions.availableServices"),
          answer: t("help.faq.answers.availableServices"),
        },
        {
          id: "request-service",
          question: t("help.faq.questions.requestService"),
          answer: t("help.faq.answers.requestService"),
        },
        {
          id: "cancel-service",
          question: t("help.faq.questions.cancelService"),
          answer: t("help.faq.answers.cancelService"),
        },
      ],
    },
    {
      id: "volunteers",
      title: t("help.faq.categories.volunteers"),
      questions: [
        {
          id: "become-volunteer",
          question: t("help.faq.questions.becomeVolunteer"),
          answer: t("help.faq.answers.becomeVolunteer"),
        },
        {
          id: "volunteer-requirements",
          question: t("help.faq.questions.volunteerRequirements"),
          answer: t("help.faq.answers.volunteerRequirements"),
        },
        {
          id: "volunteer-hours",
          question: t("help.faq.questions.volunteerHours"),
          answer: t("help.faq.answers.volunteerHours"),
        },
      ],
    },
    {
      id: "safety",
      title: t("help.faq.categories.safety"),
      questions: [
        {
          id: "volunteer-screening",
          question: t("help.faq.questions.volunteerScreening"),
          answer: t("help.faq.answers.volunteerScreening"),
        },
        {
          id: "report-issue",
          question: t("help.faq.questions.reportIssue"),
          answer: t("help.faq.answers.reportIssue"),
        },
        {
          id: "emergency-situation",
          question: t("help.faq.questions.emergencySituation"),
          answer: t("help.faq.answers.emergencySituation"),
        },
      ],
    },
  ];

  const filteredFAQs = searchQuery
    ? faqCategories
        .map((category) => ({
          ...category,
          questions: category.questions.filter(
            (q) =>
              q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              q.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((category) => category.questions.length > 0)
    : faqCategories;

  const supportOptions = [
    {
      id: "email",
      icon: <Mail className="h-6 w-6" />,
      title: t("help.support.emailUs"),
      description: t("help.support.emailDescription"),
      action: "support@villagecare.com",
      actionType: "email",
    },
    {
      id: "phone",
      icon: <Phone className="h-6 w-6" />,
      title: t("help.support.callUs"),
      description: t("help.support.callDescription"),
      action: "(123) 456-7890",
      actionType: "phone",
    },
    {
      id: "chat",
      icon: <MessageSquare className="h-6 w-6" />,
      title: t("help.support.liveChat"),
      description: t("help.support.chatDescription"),
      action: t("help.support.startChat"),
      actionType: "button",
    },
  ];

  const guides = [
    {
      id: "getting-started",
      icon: <FileText className="h-6 w-6" />,
      title: t("help.guides.gettingStarted"),
      description: t("help.guides.gettingStartedDesc"),
    },
    {
      id: "finding-volunteers",
      icon: <FileText className="h-6 w-6" />,
      title: t("help.guides.findingVolunteers"),
      description: t("help.guides.findingVolunteersDesc"),
    },
    {
      id: "managing-requests",
      icon: <FileText className="h-6 w-6" />,
      title: t("help.guides.managingRequests"),
      description: t("help.guides.managingRequestsDesc"),
    },
    {
      id: "volunteer-guide",
      icon: <FileText className="h-6 w-6" />,
      title: t("help.guides.volunteerGuide"),
      description: t("help.guides.volunteerGuideDesc"),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t("help.title")}
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {t("help.description")}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl mx-auto mb-12">
        <div className="relative">
          <input
            type="text"
            placeholder={t("help.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full p-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent",
              isRTL && "text-right pl-12 pr-4"
            )}
          />
          <Search
            className={cn(
              "absolute top-1/2 transform -translate-y-1/2 text-gray-400",
              isRTL ? "left-4" : "right-4"
            )}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQ Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <HelpCircle className={cn("h-6 w-6", isRTL ? "ml-2" : "mr-2")} />
              {t("help.faq.title")}
            </h2>

            {filteredFAQs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t("help.faq.noResults")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((category) => (
                  <div
                    key={category.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 text-left font-medium",
                        expandedCategory === category.id
                          ? "bg-rose-50 text-rose-700"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <span>{category.title}</span>
                      {expandedCategory === category.id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>

                    {expandedCategory === category.id && (
                      <div className="divide-y divide-gray-200">
                        {category.questions.map((faq) => (
                          <div
                            key={faq.id}
                            className="border-t border-gray-200"
                          >
                            <button
                              onClick={() => toggleQuestion(faq.id)}
                              className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-700 hover:bg-gray-50"
                            >
                              <span>{faq.question}</span>
                              {expandedQuestions[faq.id] ? (
                                <ChevronUp className="h-5 w-5 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-5 w-5 flex-shrink-0" />
                              )}
                            </button>
                            {expandedQuestions[faq.id] && (
                              <div className="p-4 bg-gray-50 text-gray-600">
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Support Options */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {t("help.support.title")}
            </h2>
            <div className="space-y-4">
              {supportOptions.map((option) => (
                <div key={option.id} className="flex items-start">
                  <div
                    className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center",
                      isRTL ? "ml-3" : "mr-3"
                    )}
                  >
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {option.description}
                    </p>
                    {option.actionType === "button" ? (
                      <button className="text-sm font-medium text-rose-600 hover:text-rose-700">
                        {option.action}
                      </button>
                    ) : (
                      <p className="text-sm font-medium text-rose-600">
                        {option.action}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Guides */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {t("help.guides.title")}
            </h2>
            <div className="space-y-4">
              {guides.map((guide) => (
                <a
                  key={guide.id}
                  href={`#${guide.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start">
                    <div
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center",
                        isRTL ? "ml-3" : "mr-3"
                      )}
                    >
                      {guide.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {guide.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Community Support */}
      <div className="mt-12 bg-rose-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          {t("help.community.title")}
        </h2>
        <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
          {t("help.community.description")}
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-rose-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-rose-700 transition-colors">
            {t("help.community.joinForum")}
          </button>
          <button className="bg-white text-rose-600 border border-rose-600 px-6 py-3 rounded-lg font-medium hover:bg-rose-50 transition-colors">
            {t("help.community.viewEvents")}
          </button>
        </div>
      </div>
    </div>
  );
}
