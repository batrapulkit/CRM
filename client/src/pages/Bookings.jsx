import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Hotel, Ticket, Car, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import FlightSearch from "../components/bookings/FlightSearch.jsx";
import HotelSearch from "../components/bookings/HotelSearch.jsx";
import ActivitySearch from "../components/bookings/ActivitySearch.jsx";
import CarRentalSearch from "../components/bookings/CarRentalSearch.jsx";

export default function Bookings() {
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => api.entities.Supplier.list(),
    initialData: [],
  });

  const activeSuppliers = suppliers.filter(s => s.is_active);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
          Bookings Center
        </h1>
        <p className="text-slate-600">
          Search and book flights, hotels, activities, and car rentals with AI-powered recommendations
        </p>
      </motion.div>

      {activeSuppliers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ExternalLink className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Partner Booking Agents</h2>
              <p className="text-sm text-slate-500">Direct access to your connected travel suppliers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeSuppliers.map((supplier) => (
              <Card key={supplier.id} className="border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer" onClick={() => supplier.website_url && window.open(supplier.website_url, '_blank')}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {supplier.logo_url ? (
                      <img src={supplier.logo_url} alt={supplier.name} className="w-10 h-10 rounded object-contain bg-slate-50 p-1" />
                    ) : (
                      <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-bold">
                        {supplier.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{supplier.name}</p>
                      <p className="text-xs text-slate-500">{supplier.type}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="flights" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 p-1 grid grid-cols-4 w-full lg:w-auto">
          <TabsTrigger
            value="flights"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
          >
            <Plane className="w-4 h-4 mr-2" />
            Flights
          </TabsTrigger>
          <TabsTrigger
            value="hotels"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            <Hotel className="w-4 h-4 mr-2" />
            Hotels
          </TabsTrigger>
          <TabsTrigger
            value="activities"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white"
          >
            <Ticket className="w-4 h-4 mr-2" />
            Activities
          </TabsTrigger>
          <TabsTrigger
            value="cars"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
          >
            <Car className="w-4 h-4 mr-2" />
            Car Rentals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flights">
          <FlightSearch />
        </TabsContent>

        <TabsContent value="hotels">
          <HotelSearch />
        </TabsContent>

        <TabsContent value="activities">
          <ActivitySearch />
        </TabsContent>

        <TabsContent value="cars">
          <CarRentalSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
}