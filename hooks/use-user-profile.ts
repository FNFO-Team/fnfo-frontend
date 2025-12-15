"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import {
  updateProfile as updateFirebaseProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  getIdToken as getFirebaseIdToken
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

interface UserProfile {
  name: string;
  email: string;
  country: string;
  city: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AudioSettings {
  musicVolume: number;
  sfxVolume: number;
  theme: string;
}

export function useUserProfile() {
  const { user: authUser, idToken: initialIdToken, isAuthenticated } = useAuthContext();
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    country: "",
    city: "",
  });
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    musicVolume: 70,
    sfxVolume: 80,
    theme: "dark",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load profile and settings from backend and localStorage
  useEffect(() => {
    if (!isAuthenticated || !authUser) return;

    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get token for backend request - using getIdToken with the Firebase user object from auth
        let token = initialIdToken;
        if (auth.currentUser) {
          token = await getFirebaseIdToken(auth.currentUser);
        } else if (initialIdToken) {
          token = initialIdToken;
        } else {
          throw new Error("No authentication token available");
        }

        // Load profile from backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_USER_PROFILE_URL}/api/profiles/${authUser.uid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setProfile({
            name: userData.name || authUser.displayName || '',
            email: userData.email || authUser.email || '',
            country: userData.country || '',
            city: userData.city || '',
          });
        } else {
          // Fallback to Firebase user data
          setProfile({
            name: authUser.displayName || '',
            email: authUser.email || '',
            country: '',
            city: '',
          });
        }

        // Load saved settings from localStorage
        const savedSettings = localStorage.getItem("fnf_settings");
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setAudioSettings(prev => ({ ...prev, ...settings }));
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError(err instanceof Error ? err.message : "Error loading profile");
        toast.error("Error loading profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [authUser, initialIdToken, isAuthenticated]);

  // Update profile in backend and Firebase
  const updateProfile = async (userData: Partial<UserProfile>) => {
    if (!authUser) return;

    setIsSaving(true);
    setError(null);

    try {
      // Get fresh token for the update
      let token = initialIdToken;
      if (auth.currentUser) {
        token = await getFirebaseIdToken(auth.currentUser);
      } else if (initialIdToken) {
        token = initialIdToken;
      } else {
        throw new Error("No authentication token available");
      }

      // Update backend profile - using the Firebase UID in the URL, not sending _id in the body
      const response = await fetch(`${process.env.NEXT_PUBLIC_USER_PROFILE_URL}/api/profiles/${authUser.uid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(userData) // Send only the fields that need to be updated
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error updating profile: ${response.status} - ${errorText}`);
      }

      // Update Firebase displayName if changed
      if (userData.name && auth.currentUser && auth.currentUser.displayName !== userData.name) {
        await updateFirebaseProfile(auth.currentUser, { displayName: userData.name });
      }

      // Update local state
      setProfile(prev => ({ ...prev, ...userData }));
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Error updating profile");
      toast.error("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Update password in Firebase
  const updatePasswordInFirebase = async (passwordData: PasswordData) => {
    if (!authUser || !auth.currentUser) return;

    setIsSaving(true);
    setError(null);

    try {
      // Validate inputs
      if (!passwordData.currentPassword) {
        throw new Error("Current password is required");
      }
      if (!passwordData.newPassword) {
        throw new Error("New password is required");
      }
      if (passwordData.newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters");
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error("New passwords do not match");
      }

      // Re-authenticate user with current password
      if (!auth.currentUser.email) {
        throw new Error("Email not available for reauthentication");
      }

      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        passwordData.currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, passwordData.newPassword);

      toast.success("Password updated successfully");
    } catch (err) {
      console.error("Error updating password:", err);
      if (err instanceof Error && err.message.includes('auth/wrong-password')) {
        throw new Error("Current password is incorrect");
      }
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Save audio settings to localStorage
  const saveAudioSettings = () => {
    try {
      localStorage.setItem("fnf_settings", JSON.stringify({
        musicVolume: audioSettings.musicVolume,
        sfxVolume: audioSettings.sfxVolume,
        theme: audioSettings.theme,
      }));
      toast.success("Audio settings saved");
    } catch (err) {
      console.error("Error saving audio settings:", err);
      setError(err instanceof Error ? err.message : "Error saving audio settings");
      toast.error("Error saving audio settings");
    }
  };

  return {
    profile,
    setProfile,
    audioSettings,
    setAudioSettings,
    isLoading,
    isSaving,
    error,
    updateProfile,
    updatePasswordInFirebase,
    saveAudioSettings
  };
}