// Settings page with organization branding and notification preferences
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Building2, Bell, Shield, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "@/api/client";
import { useBranding } from "@/contexts/BrandingContext";

export default function Settings() {
  const { updateBranding } = useBranding();

  // Notification toggles
  const [notifications, setNotifications] = useState({
    email: true,
    usage: true,
    billing: true,
    updates: false,
  });

  // Organization branding settings
  const [settings, setSettings] = useState({
    company_name: "",
    domain: "",
    industry: "",
    country: "",
    contact_email: "",
    logo_url: "",
  });

  // Load settings on mount
  useEffect(() => {
    api
      .get("/settings")
      .then((res) => {
        const data = res.data?.settings || {};
        setSettings({
          company_name: data.company_name || "",
          domain: data.domain || "",
          industry: data.industry || "",
          country: data.country || "",
          contact_email: data.contact_email || "",
          logo_url: data.logo_url || "",
        });
      })
      .catch(() => toast.error("Failed to load settings"));
  }, []);

  const handleSave = async () => {
    try {
      await api.put("/settings", { organization: settings });

      // Update branding context
      updateBranding({
        company_name: settings.company_name,
        logo_url: settings.logo_url
      });

      toast.success("Settings saved successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            Settings
          </h1>
          <p className="text-slate-600">Manage your organization preferences and configurations</p>
        </div>
      </motion.div>

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 p-1">
          <TabsTrigger value="organization">
            <Building2 className="w-4 h-4 mr-2" /> Organization
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" /> Security
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" /> Appearance
          </TabsTrigger>
        </TabsList>

        {/* Organization Tab */}
        <TabsContent value="organization">
          <Card className="border-slate-200/60 shadow-lg">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Update your company information</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={settings.company_name}
                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    value={settings.domain}
                    onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={settings.industry}
                    onChange={(e) => setSettings({ ...settings, industry: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={settings.country}
                    onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 flex items-center space-x-4">
                  <Label htmlFor="logo_url" className="flex-shrink-0">Logo URL</Label>
                  <Input
                    id="logo_url"
                    placeholder="https://example.com/logo.png"
                    value={settings.logo_url}
                    onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                  />
                  {settings.logo_url && (
                    <img src={settings.logo_url} alt="Logo preview" className="h-10 w-auto rounded border" />
                  )}
                </div>
              </div>
              <Button onClick={handleSave} className="bg-gradient-to-r from-indigo-600 to-cyan-500">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="border-slate-200/60 shadow-lg">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what updates you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                  <div>
                    <p className="font-medium text-slate-900">Email Notifications</p>
                    <p className="text-sm text-slate-500">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                  <div>
                    <p className="font-medium text-slate-900">Usage Alerts</p>
                    <p className="text-sm text-slate-500">Get notified when reaching credit limits</p>
                  </div>
                  <Switch
                    checked={notifications.usage}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, usage: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                  <div>
                    <p className="font-medium text-slate-900">Billing Notifications</p>
                    <p className="text-sm text-slate-500">Payment and invoice updates</p>
                  </div>
                  <Switch
                    checked={notifications.billing}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, billing: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                  <div>
                    <p className="font-medium text-slate-900">Product Updates</p>
                    <p className="text-sm text-slate-500">News about new features and improvements</p>
                  </div>
                  <Switch
                    checked={notifications.updates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, updates: checked })}
                  />
                </div>
              </div>
              <Button onClick={handleSave} className="bg-gradient-to-r from-indigo-600 to-cyan-500">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="border-slate-200/60 shadow-lg">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage access and authentication</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 mt-2">
                    <p className="text-sm text-slate-600">Add an extra layer of security</p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </div>
                <div>
                  <Label>Single Sign-On (SSO)</Label>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 mt-2">
                    <p className="text-sm text-slate-600">Configure SSO with your identity provider</p>
                    <Button variant="outline">Configure SSO</Button>
                  </div>
                </div>
                <div>
                  <Label>API Rate Limiting</Label>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 mt-2">
                    <p className="text-sm text-slate-600">Current limit: 1000 requests/minute</p>
                    <Button variant="outline">Adjust Limits</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card className="border-slate-200/60 shadow-lg">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize your dashboard experience</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label>Theme</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="p-4 rounded-lg border-2 border-indigo-600 bg-white cursor-pointer">
                    <p className="font-medium">Light Mode</p>
                    <p className="text-sm text-slate-500">Current theme</p>
                  </div>
                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-900 cursor-pointer">
                    <p className="font-medium text-white">Dark Mode</p>
                    <p className="text-sm text-slate-400">Coming soon</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}