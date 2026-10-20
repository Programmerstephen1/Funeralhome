/** API contracts for incremental strict TypeScript adoption. Keep in sync with Flask DTOs. */

export interface ApiError {
  error?: string;
  message?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  profile_picture: string | null;
  is_verified: boolean;
  is_admin: boolean;
}

export interface ProductSummary {
  id: number;
  categoryId: string;
  title: string;
  desc: string;
  /** Legacy API amount in KES; convert to integer minor units during the money migration. */
  price: number;
  discount_percent: number | null;
  has_sizes: boolean;
  inclusions: string[];
  dispatch_location: string | null;
  average_rating: number;
  product_rating: number;
  service_rating: number;
  review_count: number;
  images: string[];
  specifications: Array<{ key: string; value: string }>;
}

export interface PaymentStatus {
  checkout_request_id: string;
  status: "pending" | "completed" | "failed" | string;
}

export interface UploadResponse {
  image_url: string;
}
