// Generic authenticated API client that receives the token directly
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {},
  idToken?: string | null
): Promise<Response> => {
  if (!idToken) {
    throw new Error('Authentication token is required for this request');
  }

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};

// Type for user profile data
export interface UserProfile {
  userId: string;
  username: string;
  email?: string;
  displayName?: string;
  wins?: number;
  losses?: number;
  createdAt?: string;
  updatedAt?: string;
  // Add other profile fields as needed by your backend
}

// User profile API client
export const userProfileApi = {
  // Get user profile
  async getProfile(userId: string, idToken: string | null): Promise<UserProfile> {
    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_USER_PROFILE_URL}/api/profiles/${userId}`,
      {
        method: 'GET',
      },
      idToken
    );
    return response.json();
  },

  // Create user profile
  async createProfile(profileData: Omit<UserProfile, 'userId' | 'createdAt' | 'updatedAt'>, idToken: string | null): Promise<UserProfile> {
    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_USER_PROFILE_URL}/api/profiles`,
      {
        method: 'POST',
        body: JSON.stringify(profileData),
      },
      idToken
    );
    return response.json();
  },

  // Update user profile
  async updateProfile(userId: string, profileData: Partial<UserProfile>, idToken: string | null): Promise<UserProfile> {
    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_USER_PROFILE_URL}/api/profiles/${userId}`,
      {
        method: 'PUT',
        body: JSON.stringify(profileData),
      },
      idToken
    );
    return response.json();
  },

  // Delete user profile
  async deleteProfile(userId: string, idToken: string | null): Promise<void> {
    await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_USER_PROFILE_URL}/api/profiles/${userId}`,
      {
        method: 'DELETE',
      },
      idToken
    );
  },
  
  // Get current user's profile (if userId is not provided, assume it's the current user)
  async getCurrentUserProfile(idToken: string | null): Promise<UserProfile> {
    // For this endpoint, we assume the backend can get the user ID from the token
    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_USER_PROFILE_URL}/api/profiles/me`,
      {
        method: 'GET',
      },
      idToken
    );
    return response.json();
  },
};