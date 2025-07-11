import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Bell, Shield, Save, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Button } from "~/common/components/ui/button";
import { Switch } from "~/common/components/ui/switch";
import { Separator } from "~/common/components/ui/separator";
import { Alert, AlertDescription } from "~/common/components/ui/alert";
import { makeSSRClient } from "~/supa-client";
import { redirect } from 'react-router';
import type { Route } from './+types/settings-page';

export const loader = async ({request}: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const { data: {user} } = await client.auth.getUser();
  if (!user) {
    return redirect('/auth/login');
  }
  
  // 사용자 설정 가져오기
  const { data: settings } = await client
    .from("user_setting_table")
    .select("setting_key, setting_value")
    .eq("user_id", user.id);
    
  return { settings: settings || [] };
};

export const action = async ({request}: Route.ActionArgs) => {
  const formData = await request.formData();
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) {
    return redirect('/auth/login');
  }

  try {
    const settings = [
      { key: "email_messages", value: formData.get("email_messages") === "on" ? "true" : "false" },
      { key: "email_sales", value: formData.get("email_sales") === "on" ? "true" : "false" },
      { key: "email_reviews", value: formData.get("email_reviews") === "on" ? "true" : "false" },
      { key: "email_system", value: formData.get("email_system") === "on" ? "true" : "false" },
      { key: "profile_public", value: formData.get("profile_public") === "on" ? "true" : "false" },
      { key: "location_public", value: formData.get("location_public") === "on" ? "true" : "false" },
    ];

    // 기존 설정 삭제 후 새로 삽입
    await client
      .from("user_setting_table")
      .delete()
      .eq("user_id", user.id);

    const { error } = await client
      .from("user_setting_table")
      .insert(settings.map(setting => ({
        user_id: user.id,
        setting_key: setting.key,
        setting_value: setting.value,
        updated_at: new Date().toISOString()
      })));

    if (error) {
      console.error("Settings update error:", error);
      return { success: false, error: 'Failed to update settings' };
    }

    return { success: true, message: 'Settings updated successfully' };
  } catch (error) {
    console.error('Action error:', error);
    return { success: false, error: 'An error occurred while updating settings' };
  }
};

export default function SettingsPage({ loaderData }: Route.ComponentProps) {
  const { settings } = loaderData;
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 설정값을 객체로 변환
  const settingsMap = settings.reduce((acc: Record<string, string>, setting: any) => {
    acc[setting.setting_key] = setting.setting_value;
    return acc;
  }, {});

  const [formData, setFormData] = useState({
    email_messages: settingsMap.email_messages === "true",
    email_sales: settingsMap.email_sales === "true",
    email_reviews: settingsMap.email_reviews === "true",
    email_system: settingsMap.email_system === "true",
    profile_public: settingsMap.profile_public !== "false", // 기본값 true
    location_public: settingsMap.location_public !== "false", // 기본값 true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value ? "on" : "off");
    });

    try {
      const response = await fetch('/my/settings', {
        method: 'POST',
        body: form,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Settings updated successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating settings' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences and privacy settings.</p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Choose which notifications you want to receive via email</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">New Messages</h4>
                <p className="text-sm text-gray-500">Get notified when someone sends you a message</p>
              </div>
              <Switch
                checked={formData.email_messages}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, email_messages: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Sales & Offers</h4>
                <p className="text-sm text-gray-500">Notifications about your product listings</p>
              </div>
              <Switch
                checked={formData.email_sales}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, email_sales: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Reviews & Feedback</h4>
                <p className="text-sm text-gray-500">When someone reviews your products or profile</p>
              </div>
              <Switch
                checked={formData.email_reviews}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, email_reviews: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">System Updates</h4>
                <p className="text-sm text-gray-500">Important updates about the platform</p>
              </div>
              <Switch
                checked={formData.email_system}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, email_system: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-green-600" />
              <div>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control who can see your information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Public Profile</h4>
                <p className="text-sm text-gray-500">Allow others to view your profile and listings</p>
              </div>
              <Switch
                checked={formData.profile_public}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, profile_public: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Location Information</h4>
                <p className="text-sm text-gray-500">Show your location in listings and profile</p>
              </div>
              <Switch
                checked={formData.location_public}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, location_public: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
