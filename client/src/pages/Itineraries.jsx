import React, { useState } from "react";
import api from "@/api/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";

import ItineraryList from "../components/itineraries/ItineraryList.jsx";
import CreateItineraryDialog from "../components/itineraries/CreateItineraryDialog.jsx";
import AIItineraryBuilder from "../components/itineraries/AIItineraryBuilder.jsx";

export default function Itineraries() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAIBuilder, setShowAIBuilder] = useState(false);
  const queryClient = useQueryClient();

  // FIXED: Use your backend API endpoint
  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ['itineraries'],
    queryFn: async () => {
      const res = await api.get('/itineraries');
      return res.data.itineraries || []; // ALWAYS an array
    },
    initialData: [],
  });

  const handleDialogClose = () => {
    setShowCreateDialog(false);
    refetch();
  };

  const handleAIBuilderClose = () => {
    setShowAIBuilder(false);
    refetch();
  };

  // Filtering stays the same
  const filteredItineraries = data.filter(itin =>
    itin.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    itin.ai_generated_content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
              Itineraries
            </h1>
            <p className="text-slate-600">
              Create AI-powered trip plans and share with clients
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAIBuilder(true)}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              AI Itinerary
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(true)}
            >
              Manual Create
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search itineraries by destination..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </motion.div>

      <ItineraryList 
        itineraries={filteredItineraries}
        isLoading={isLoading}
      />

      {showCreateDialog && (
        <CreateItineraryDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
        />
      )}

      {showAIBuilder && (
        <AIItineraryBuilder
          open={showAIBuilder}
          onClose={() => setShowAIBuilder(false)}
        />
      )}
    </div>
  );
}
