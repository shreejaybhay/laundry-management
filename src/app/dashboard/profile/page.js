"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Save } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    email: ''
  });

  // Fetch user profile data
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) throw new Error('Failed to fetch profile');
        
        const data = await response.json();
        
        if (data.user) {
          setProfile({
            name: data.user.name || '',
            email: data.user.email || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setInitialLoad(false);
      }
    }

    fetchUserProfile();
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
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
    } catch (error) {
      console.error('Save profile error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-[800px] mx-auto p-8">
        <motion.div 
          className="mb-10"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <h1 className="text-4xl font-bold tracking-tight">Profile</h1>
          <p className="mt-2 text-muted-foreground text-lg">
            Manage your personal information
          </p>
        </motion.div>

        <Card className="border-none shadow-2xl bg-gradient-to-br from-background to-muted/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name"
                    className="pl-9"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email"
                    type="email"
                    className="pl-9"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
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
      </div>
    </div>
  );
}
