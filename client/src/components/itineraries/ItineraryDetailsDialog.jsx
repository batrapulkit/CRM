import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, DollarSign, Clock, FileDown, Edit, Send, Plane, Hotel, Utensils, Camera, Sun, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { downloadItineraryPDF } from "@/utils/pdfGenerator";
import api from "@/api/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ItineraryDetailsDialog({ itinerary, open, onClose, onEdit }) {
    const [isExporting, setIsExporting] = useState(false);
    const [branding, setBranding] = useState({ company_name: "Triponic", logo_url: "" });
    const queryClient = useQueryClient();

    // Load branding (company name & logo) from settings
    useEffect(() => {
        api
            .get("/settings")
            .then((res) => {
                const data = res.data?.settings || {};
                setBranding({
                    company_name: data.company_name || "Triponic",
                    logo_url: data.logo_url || "",
                });
            })
            .catch(() => {
                // keep defaults
            });
    }, []);

    const updateStatusMutation = useMutation({
        mutationFn: (newStatus) => api.patch(`/itineraries/${itinerary?.id}`, { status: newStatus }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['itineraries'] });
            toast.success("Status updated successfully");
        },
        onError: () => {
            toast.error("Failed to update status");
        }
    });

    if (!itinerary) return null;

    const details = itinerary.ai_generated_json?.detailedPlan || itinerary.ai_generated_json || {};
    const days = details.dailyPlan || details.daily || [];

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            await downloadItineraryPDF(itinerary, branding.company_name, branding.logo_url);
            toast.success("PDF downloaded successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate PDF");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <div className="p-6 border-b bg-slate-50/50 relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                        onClick={onClose}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                    <DialogHeader>
                        <div className="flex items-center justify-between mr-8">
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-slate-900">
                                {itinerary.title || details.title || details.destination || "Trip Itinerary"}
                                <Select
                                    defaultValue={itinerary.status || 'draft'}
                                    onValueChange={(val) => updateStatusMutation.mutate(val)}
                                >
                                    <SelectTrigger className="w-[120px] h-8 ml-2">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="sent">Sent</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="booked">Booked</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </DialogTitle>
                        </div>
                        <DialogDescription className="flex flex-wrap gap-6 pt-4 text-sm" as="div">
                            <span className="flex items-center gap-2 text-slate-600">
                                <MapPin className="w-4 h-4 text-purple-600" />
                                {itinerary.destination}
                            </span>
                            <span className="flex items-center gap-2 text-slate-600">
                                <Calendar className="w-4 h-4 text-purple-600" />
                                {itinerary.duration} Days
                            </span>
                            <span className="flex items-center gap-2 text-slate-600">
                                <Users className="w-4 h-4 text-purple-600" />
                                {itinerary.travelers} Travelers
                            </span>
                            {itinerary.budget && (
                                <span className="flex items-center gap-2 text-slate-600">
                                    <DollarSign className="w-4 h-4 text-purple-600" />
                                    {itinerary.budget} Budget
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                    <div className="space-y-8">
                        {/* Summary */}
                        {(details.description || details.summary || itinerary.ai_generated_content) && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <h3 className="text-lg font-semibold mb-3 text-slate-900">Trip Overview</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {details.description || details.summary || (typeof itinerary.ai_generated_content === 'string' ? itinerary.ai_generated_content : '')}
                                </p>
                            </div>
                        )}

                        {/* Flights & Hotels Grid */}
                        {(details.flights || details.hotel) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {details.flights && (
                                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-2 mb-4 text-blue-600">
                                            <Plane className="w-5 h-5" />
                                            <h3 className="font-semibold">Flight Details</h3>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Airline</span>
                                                <span className="font-medium">{details.flights.airline}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Departure</span>
                                                <span className="font-medium">{details.flights.departure}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Duration</span>
                                                <span className="font-medium">{details.flights.duration}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Est. Price</span>
                                                <span className="font-medium">{details.flights.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {details.hotel && (
                                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-2 mb-4 text-indigo-600">
                                            <Hotel className="w-5 h-5" />
                                            <h3 className="font-semibold">Accommodation</h3>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Hotel</span>
                                                <span className="font-medium">{details.hotel.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Location</span>
                                                <span className="font-medium">{details.hotel.location}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Rating</span>
                                                <span className="font-medium">{details.hotel.rating} ⭐</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Price</span>
                                                <span className="font-medium">{details.hotel.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Day-by-Day */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                Day-by-Day Plan
                            </h3>
                            {days.length > 0 ? (
                                <div className="space-y-6">
                                    {days.map((day, idx) => (
                                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                            <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <Badge className="bg-slate-900 text-white hover:bg-slate-800">Day {day.day}</Badge>
                                                    <h4 className="font-bold text-slate-900">{day.title}</h4>
                                                </div>
                                                {day.weather && (
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-2 py-1 rounded-full border">
                                                        <Sun className="w-3 h-3 text-orange-400" />
                                                        {day.weather}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-5 space-y-4">
                                                <p className="text-slate-600 text-sm">{day.description}</p>

                                                {/* Activities */}
                                                {day.activities && day.activities.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                            <Camera className="w-3 h-3" /> Activities
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {day.activities.map((act, i) => (
                                                                <div key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 p-2 rounded-lg">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                                                                    <div>
                                                                        <span className="font-medium">{act}</span>
                                                                        {day.activitiesDescription && day.activitiesDescription[i] && (
                                                                            <p className="text-xs text-slate-500 mt-0.5">{day.activitiesDescription[i]}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Meals */}
                                                {day.meals && (
                                                    <div className="grid grid-cols-3 gap-2 pt-2">
                                                        {Object.entries(day.meals).map(([type, meal]) => (
                                                            meal && (
                                                                <div key={type} className="text-xs bg-orange-50 text-orange-900 p-2 rounded border border-orange-100">
                                                                    <span className="font-bold capitalize block mb-0.5">{type}</span>
                                                                    {meal}
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap text-slate-600 bg-white p-6 rounded-xl border border-slate-100">
                                    {typeof itinerary.ai_generated_content === 'string' ? itinerary.ai_generated_content : JSON.stringify(itinerary.ai_generated_content, null, 2)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-t bg-white flex gap-3 justify-end">
                    <Button variant="outline" onClick={onEdit} className="gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="gap-2"
                    >
                        <FileDown className="w-4 h-4" />
                        {isExporting ? "Generating PDF..." : "Export PDF"}
                    </Button>

                </div>
            </DialogContent>
        </Dialog>
    );
}
