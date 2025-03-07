
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Save, Settings } from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { WashingMachineLoader } from "@/components/ui/washing-machine-loader";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: ''
  });

  // Handle theme mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Add minimum loading time effect
  useEffect(() => {
    const minLoadingTime = setTimeout(() => {
      setShowLoader(false);
    }, 1500); // 1.5 seconds minimum loading time

    return () => clearTimeout(minLoadingTime);
  }, []);

  // Fetch user profile
  useEffect(() => {
    let mounted = true;

    async function fetchUserData() {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) throw new Error('Failed to fetch profile');

        const data = await response.json();

        if (mounted && data.user) {
          setProfile({
            name: data.user.name || '',
            email: data.user.email || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (mounted) {
          toast.error('Failed to load profile');
        }
      } finally {
        if (mounted) {
          setInitialLoad(false);
        }
      }
    }

    fetchUserData();

    return () => {
      mounted = false;
    };
  }, []);

  // Show loading spinner while fetching initial data or during minimum loading time
  if (initialLoad || showLoader) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <WashingMachineLoader />
        <p className="mt-4 text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      toast.success('Profile updated successfully');

      if (data.user) {
        setProfile({
          name: data.user.name || '',
          email: data.user.email || ''
        });
      }
    } catch (error) {
      console.error('Save profile error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = () => {
    toast.success('Theme preference saved');
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Settings</h2>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card className="border-none shadow-2xl bg-gradient-to-br from-background to-muted/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-semibold">
                <User className="mr-2 h-6 w-6 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    className="h-10 bg-muted/50"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    className="h-10 bg-muted/50"
                    placeholder="Enter your email"
                    type="email"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="h-10 px-4 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="border-none shadow-2xl bg-gradient-to-br from-background to-muted/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-semibold">
                <Settings className="mr-2 h-6 w-6 text-primary" />
                User Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Theme Preference</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred theme mode
                    </p>
                  </div>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSavePreferences}
                  disabled={loading}
                  className="h-10 px-4 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

