import React, { useState, useEffect } from 'react';
import api from "@/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function CreateItineraryDialog({ open, onClose, itineraryToEdit = null }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
    travelers: 2,
    trip_type: 'family',
    budget: '',
    client_id: '',
  });

  useEffect(() => {
    if (itineraryToEdit) {
      setFormData({
        title: itineraryToEdit.title || '',
        destination: itineraryToEdit.destination || '',
        start_date: itineraryToEdit.start_date ? new Date(itineraryToEdit.start_date).toISOString().split('T')[0] : '',
        end_date: itineraryToEdit.end_date ? new Date(itineraryToEdit.end_date).toISOString().split('T')[0] : '',
        travelers: itineraryToEdit.travelers || 2,
        trip_type: itineraryToEdit.trip_type || 'family',
        budget: itineraryToEdit.budget || '',
        client_id: itineraryToEdit.client_id || itineraryToEdit.client?.id || '',
      });
    } else {
      setFormData({
        title: '',
        destination: '',
        start_date: '',
        end_date: '',
        travelers: 2,
        trip_type: 'family',
        budget: '',
        client_id: '',
      });
    }
  }, [itineraryToEdit, open]);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.entities.Client.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.entities.Itinerary.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
      toast.success('Itinerary created successfully');
      onClose();
    },
    onError: (err) => {
      toast.error('Failed to create itinerary');
      console.error(err);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.entities.Itinerary.update(itineraryToEdit?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
      toast.success('Itinerary updated successfully');
      onClose();
    },
    onError: (err) => {
      toast.error('Failed to update itinerary');
      console.error(err);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const itineraryData = {
      ...formData,
      travelers: parseInt(formData.travelers),
      budget: formData.budget ? parseFloat(formData.budget) : null,
      // Only set default status on create, preserve on update unless logic changes
      ...(itineraryToEdit ? {} : { status: 'draft', ai_generated: false }),
    };

    if (itineraryToEdit) {
      updateMutation.mutate(itineraryData);
    } else {
      createMutation.mutate(itineraryData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{itineraryToEdit ? 'Edit Itinerary' : 'Create Manual Itinerary'}</DialogTitle>
          <DialogDescription>
            {itineraryToEdit ? 'Update existing itinerary details' : 'Build a custom itinerary from scratch'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Amazing Paris Adventure"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="client">Client *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name || client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="Paris, France"
                required
              />
            </div>

            <div>
              <Label htmlFor="trip_type">Trip Type</Label>
              <Select
                value={formData.trip_type}
                onValueChange={(value) => setFormData({ ...formData, trip_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="honeymoon">Honeymoon</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="adventure">Adventure</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="travelers">Travelers</Label>
              <Input
                id="travelers"
                type="number"
                min="1"
                value={formData.travelers}
                onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="2000"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-600"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (itineraryToEdit ? 'Update Itinerary' : 'Create Itinerary')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}