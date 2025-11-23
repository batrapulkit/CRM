import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Users,
  Map,
  Plane,
  FileText,
  Building2,
  DollarSign,
  Settings,
  LogOut,
  Search,
  Menu,
  MessageSquare,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import AgencyBranding from "./agency/AgencyBranding.jsx";
import AIAssistant from "./ai/AIAssistant.jsx";
import { useBranding } from "@/contexts/BrandingContext";
import TriponicWatermark from "./TriponicWatermark.jsx";

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "CRM & Leads", url: createPageUrl("CRM"), icon: Users },
  { title: "Itineraries", url: createPageUrl("Itineraries"), icon: Map },
  { title: "Bookings", url: createPageUrl("Bookings"), icon: Plane },
  { title: "Clients", url: createPageUrl("Clients"), icon: Users },
  { title: "Quotes", url: createPageUrl("Quotes"), icon: FileText },
  { title: "Suppliers", url: createPageUrl("Suppliers"), icon: Building2 },
  { title: "Finance", url: createPageUrl("Finance"), icon: DollarSign },
  { title: "Settings", url: createPageUrl("Settings"), icon: Settings },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [showAI, setShowAI] = useState(false);
  const { company_name, plan } = useBranding();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-purple-50/20">
        {/* Sidebar */}
        <Sidebar className="border-r border-slate-200/60 backdrop-blur-xl bg-white/95">
          <SidebarHeader className="border-b border-slate-200/60 p-4">
            <AgencyBranding />
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`group relative mb-1 rounded-xl transition-all duration-300 ${isActive
                            ? "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                            : "hover:bg-slate-100/80 text-slate-700"
                            }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-2.5">
                            <item.icon
                              className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500 group-hover:text-purple-600"
                                } transition-colors`}
                            />
                            <span className="font-medium text-sm">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/60 p-4">
            <Button
              onClick={() => setShowAI(!showAI)}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white shadow-lg mb-3"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Ask Tono AI
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{company_name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{company_name}</p>
                <p className="text-xs text-slate-500 truncate">{plan}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  signOut();
                  navigate('/login');
                }}
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative">
          <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <SidebarTrigger className="lg:hidden hover:bg-slate-100 p-2 rounded-lg">
                  <Menu className="w-5 h-5" />
                </SidebarTrigger>
                <div className="relative flex-1 max-w-md hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search leads, trips, clients... (Ctrl+K)"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  All Systems Live
                </Badge>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">{children}</div>
          <TriponicWatermark />

          {/* AI Assistant Modal */}
          {showAI && <AIAssistant onClose={() => setShowAI(false)} />}
        </main>
      </div>
    </SidebarProvider>
  );
}
