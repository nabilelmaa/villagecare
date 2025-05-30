export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone_number: string
  city: string
  gender: string
  bio: string;
  role: string;
  rating: number;
  review_count: number;
  profile_image_url: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: number
  name: string
  name_en: string
  name_fr: string
  name_ar: string
  description: string | null
  created_at: string
  updated_at: string
  selected: boolean
}

export interface Review {
  id: number
  rating: number;
  comment: string;
  elder_first_name: string;
  elder_last_name: string;
  elder_profile_picture: string;
  created_at: string;
}

export interface Availability {
  day_of_week: string
  time_of_day: string
  selected: boolean
}

export interface ToastProps {
    body: string;
}