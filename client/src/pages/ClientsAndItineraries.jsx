import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog } from '../components/ui/dialog';
import {
  Plus, Search, Mail, Phone, Building, MapPin,
  Users, TrendingUp, Edit, Trash2, FileText, X,
  ChevronDown, ChevronUp, Loader
} from 'lucide-react';
import api from '../api/client';

export default function ClientsAndItineraries() {
  // ==================== STATE ====================
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Client Dialog State
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientFormData, setClientFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    country: '',
    notes: ''
  });

  // Itinerary Dialog State
  const [showItineraryDialog, setShowItineraryDialog] = useState(false);
  const [selectedClientForItinerary, setSelectedClientForItinerary] = useState(null);
  const [itineraryFormData, setItineraryFormData] = useState({
    destination: '',
    starting_point: '',
    start_date: '',
    end_date: '',
    travelers: 2,
    trip_type: 'family',
    budget: '',
  });

  // Expanded Clients State
  const [expandedClients, setExpandedClients] = useState({});
  const [clientItineraries, setClientItineraries] = useState({});
  const [loadingItineraries, setLoadingItineraries] = useState({});

  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    new_this_month: 0
  });

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchClients();
    fetchStats();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchTerm, clients]);

  // ==================== FETCH FUNCTIONS ====================
  const fetchClients = async () => {
    try {
      setLoading(true);
      console.log('[UNIFIED] Fetching all clients...');
      const response = await api.get('/clients');
      const clientsList = response.data.clients || [];
      setClients(clientsList);
      console.log('[UNIFIED] Fetched', clientsList.length, 'clients');
    } catch (error) {
      console.error('[UNIFIED] Error fetching clients:', error);
      alert('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('[UNIFIED] Fetching stats...');
      const response = await api.get('/clients/stats');
      const statsData = response.data.stats;
      
      if (statsData.clients) {
        setStats({
          total: statsData.clients.total || 0,
          active: statsData.clients.active || 0,
          inactive: (statsData.clients.total || 0) - (statsData.clients.active || 0),
          new_this_month: statsData.clients.new_this_month || 0
        });
      }
      console.log('[UNIFIED] Stats updated');
    } catch (error) {
      console.error('[UNIFIED] Error fetching stats:', error);
    }
  };

  const fetchClientItineraries = async (clientId) => {
    try {
      console.log('[UNIFIED] Fetching itineraries for client:', clientId);
      setLoadingItineraries(prev => ({ ...prev, [clientId]: true }));
      
      const response = await api.get(`/itineraries?client_id=${clientId}`);
      const itineraries = response.data.itineraries || [];
      
      setClientItineraries(prev => ({
        ...prev,
        [clientId]: itineraries
      }));
      
      console.log('[UNIFIED] Fetched', itineraries.length, 'itineraries for client:', clientId);
    } catch (error) {
      console.error('[UNIFIED] Error fetching itineraries:', error);
      setClientItineraries(prev => ({
        ...prev,
        [clientId]: []
      }));
    } finally {
      setLoadingItineraries(prev => ({ ...prev, [clientId]: false }));
    }
  };

  // ==================== FILTER FUNCTIONS ====================
  const filterClients = () => {
    if (!searchTerm) {
      setFilteredClients(clients);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      (client.company && client.company.toLowerCase().includes(term))
    );
    setFilteredClients(filtered);
  };

  // ==================== CLIENT HANDLERS ====================
  const handleAddClient = () => {
    setSelectedClient(null);
    setClientFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      city: '',
      country: '',
      notes: ''
    });
    setShowClientDialog(true);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setClientFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      company: client.company || '',
      address: client.address || '',
      city: client.city || '',
      country: client.country || '',
      notes: client.notes || ''
    });
    setShowClientDialog(true);
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();

    if (!clientFormData.name || !clientFormData.email) {
      alert('Name and email are required');
      return;
    }

    try {
      console.log('[UNIFIED] Saving client...');
      if (selectedClient) {
        await api.put(`/clients/${selectedClient.id}`, clientFormData);
        console.log('[UNIFIED] Client updated:', selectedClient.id);
      } else {
        await api.post('/clients', clientFormData);
        console.log('[UNIFIED] New client created');
      }

      setShowClientDialog(false);
      setSelectedClient(null);
      await fetchClients();
      await fetchStats();
    } catch (error) {
      console.error('[UNIFIED] Error saving client:', error);
      alert(error.response?.data?.error || 'Failed to save client');
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      console.log('[UNIFIED] Deleting client:', clientId);
      await api.delete(`/clients/${clientId}`);
      await fetchClients();
      await fetchStats();
    } catch (error) {
      console.error('[UNIFIED] Error deleting client:', error);
      alert(error.response?.data?.error || 'Failed to delete client');
    }
  };

  // ==================== ITINERARY HANDLERS ====================
  const handleAddItinerary = (client) => {
    setSelectedClientForItinerary(client);
    setItineraryFormData({
      title: '',
      destination: '',
      start_date: '',
      end_date: '',
      travelers: 2,
      trip_type: 'family',
      budget: '',
    });
    setShowItineraryDialog(true);
  };

  const handleSaveItinerary = async (e) => {
    e.preventDefault();

    if (!itineraryFormData.title || !itineraryFormData.destination) {
      alert('Title and destination are required');
      return;
    }

    try {
      console.log('[UNIFIED] Creating itinerary for client:', selectedClientForItinerary.id);
      
      const payload = {
        title: itineraryFormData.title.trim(),
        destination: itineraryFormData.destination.trim(),
        start_date: itineraryFormData.start_date || null,
        end_date: itineraryFormData.end_date || null,
        travelers: parseInt(itineraryFormData.travelers) || 1,
        trip_type: itineraryFormData.trip_type || 'general',
        budget: itineraryFormData.budget ? parseFloat(itineraryFormData.budget) : null,
        client_id: selectedClientForItinerary.id,
        status: 'draft',
        ai_generated: false,
      };

      console.log('[UNIFIED] Itinerary payload:', JSON.stringify(payload, null, 2));

      const response = await api.post('/itineraries', payload);
      
      console.log('[UNIFIED] Itinerary created successfully:', response.data);

      setShowItineraryDialog(false);
      setSelectedClientForItinerary(null);
      setItineraryFormData({
        title: '',
        destination: '',
        start_date: '',
        end_date: '',
        travelers: 2,
        trip_type: 'family',
        budget: '',
      });
      
      // Refresh itineraries for this client
      await fetchClientItineraries(selectedClientForItinerary.id);
    } catch (error) {
      console.error('[UNIFIED] Error creating itinerary:', error);
      console.error('[UNIFIED] Error response:', error.response?.data);
      alert(error.response?.data?.details || error.response?.data?.error || 'Failed to create itinerary');
    }
  };

  const handleDeleteItinerary = async (itineraryId, clientId) => {
    if (!confirm('Are you sure you want to delete this itinerary?')) return;

    try {
      console.log('[UNIFIED] Deleting itinerary:', itineraryId);
      await api.delete(`/itineraries/${itineraryId}`);
      await fetchClientItineraries(clientId);
    } catch (error) {
      console.error('[UNIFIED] Error deleting itinerary:', error);
      alert(error.response?.data?.error || 'Failed to delete itinerary');
    }
  };

  // ==================== EXPAND/COLLAPSE ====================
  const toggleClientExpanded = async (clientId) => {
    const isExpanded = expandedClients[clientId];
    
    if (!isExpanded) {
      // Expanding - fetch itineraries if not already loaded
      if (!clientItineraries[clientId]) {
        await fetchClientItineraries(clientId);
      }
    }

    setExpandedClients(prev => ({
      ...prev,
      [clientId]: !isExpanded
    }));
  };

  // ==================== RENDER ====================
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Clients & Itineraries</h1>
          <p className="text-gray-600 mt-1">Manage clients and create itineraries in one place</p>
        </div>
        <Button onClick={handleAddClient} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Clients</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Active</p>
              <p className="text-3xl font-bold text-green-900">{stats.active}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">New This Month</p>
              <p className="text-3xl font-bold text-purple-900">{stats.new_this_month}</p>
            </div>
            <Plus className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Itineraries</p>
              <p className="text-3xl font-bold text-orange-900">
                {Object.values(clientItineraries).flat().length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-orange-400" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4 border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clients by name, email, or company..."
            className="pl-10"
          />
        </div>
      </Card>

      {/* Clients List */}
      <div className="space-y-3">
        {loading ? (
          <Card className="p-12 text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Loading clients...</p>
          </Card>
        ) : filteredClients.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first client'}
            </p>
            {!searchTerm && (
              <Button onClick={handleAddClient} className="bg-blue-600">
                Add Your First Client
              </Button>
            )}
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="border-gray-200 overflow-hidden">
              {/* Client Header */}
              <div
                className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleClientExpanded(client.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{client.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {client.email}
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {client.phone}
                          </div>
                        )}
                        {client.company && (
                          <div className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {client.company}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                      {clientItineraries[client.id]?.length || 0} itineraries
                    </span>
                    {expandedClients[client.id] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedClients[client.id] && (
                <div className="border-t border-gray-200">
                  {/* Client Details */}
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {client.city && (
                        <div>
                          <p className="text-xs text-gray-500 font-medium">City</p>
                          <p className="text-sm text-gray-900">{client.city}</p>
                        </div>
                      )}
                      {client.country && (
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Country</p>
                          <p className="text-sm text-gray-900">{client.country}</p>
                        </div>
                      )}
                      {client.address && (
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 font-medium">Address</p>
                          <p className="text-sm text-gray-900">{client.address}</p>
                        </div>
                      )}
                    </div>

                    {client.notes && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 font-medium">Notes</p>
                        <p className="text-sm text-gray-900">{client.notes}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditClient(client)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddItinerary(client)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Itinerary
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-red-600 hover:text-red-700 border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Itineraries Section */}
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-3">Itineraries</h4>

                    {loadingItineraries[client.id] ? (
                      <div className="text-center py-4">
                        <Loader className="w-5 h-5 animate-spin mx-auto text-blue-600" />
                      </div>
                    ) : clientItineraries[client.id]?.length === 0 ? (
                      <p className="text-sm text-gray-600 text-center py-4">
                        No itineraries yet. Create one to get started!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {clientItineraries[client.id]?.map((itinerary) => (
                          <div
                            key={itinerary.id}
                            className="p-3 bg-white rounded-lg border border-gray-200 flex items-start justify-between"
                          >
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">
                                {itinerary.title || itinerary.destination}
                              </h5>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                                {itinerary.destination && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {itinerary.destination}
                                  </span>
                                )}
                                {itinerary.duration && (
                                  <span>{itinerary.duration} days</span>
                                )}
                                {itinerary.travelers && (
                                  <span>{itinerary.travelers} travelers</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                itinerary.status === 'draft'
                                  ? 'bg-gray-100 text-gray-700'
                                  : itinerary.status === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {itinerary.status}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteItinerary(itinerary.id, client.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Client Dialog */}
      {showClientDialog && (
        <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {selectedClient ? 'Edit Client' : 'Add New Client'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClientDialog(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSaveClient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={clientFormData.name}
                      onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={clientFormData.email}
                      onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={clientFormData.phone}
                      onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input
                      value={clientFormData.company}
                      onChange={(e) => setClientFormData({ ...clientFormData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Address</Label>
                  <Input
                    value={clientFormData.address}
                    onChange={(e) => setClientFormData({ ...clientFormData, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={clientFormData.city}
                      onChange={(e) => setClientFormData({ ...clientFormData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input
                      value={clientFormData.country}
                      onChange={(e) => setClientFormData({ ...clientFormData, country: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <textarea
                    value={clientFormData.notes}
                    onChange={(e) => setClientFormData({ ...clientFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows="3"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {selectedClient ? 'Update Client' : 'Add Client'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowClientDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </Dialog>
      )}

      {/* Add Itinerary Dialog */}
      {showItineraryDialog && selectedClientForItinerary && (
        <Dialog open={showItineraryDialog} onOpenChange={setShowItineraryDialog}>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Create Itinerary</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    For: <span className="font-semibold">{selectedClientForItinerary.name}</span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowItineraryDialog(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSaveItinerary} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Title *</Label>
                    <Input
                      value={itineraryFormData.title}
                      onChange={(e) => setItineraryFormData({ ...itineraryFormData, title: e.target.value })}
                      placeholder="e.g., Paris Adventure"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Destination *</Label>
                    <Input
                      value={itineraryFormData.destination}
                      onChange={(e) => setItineraryFormData({ ...itineraryFormData, destination: e.target.value })}
                      placeholder="e.g., Paris, France"
                      required
                    />
                  </div>
                  <div>
                    <Label>Trip Type</Label>
                    <select
                      value={itineraryFormData.trip_type}
                      onChange={(e) => setItineraryFormData({ ...itineraryFormData, trip_type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="family">Family</option>
                      <option value="honeymoon">Honeymoon</option>
                      <option value="adventure">Adventure</option>
                      <option value="luxury">Luxury</option>
                      <option value="business">Business</option>
                      <option value="group">Group</option>
                      <option value="budget">Budget</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={itineraryFormData.start_date}
                      onChange={(e) => setItineraryFormData({ ...itineraryFormData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={itineraryFormData.end_date}
                      onChange={(e) => setItineraryFormData({ ...itineraryFormData, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Travelers</Label>
                    <Input
                      type="number"
                      min="1"
                      value={itineraryFormData.travelers}
                      onChange={(e) => setItineraryFormData({ ...itineraryFormData, travelers: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Budget (USD)</Label>
                    <Input
                      type="number"
                      value={itineraryFormData.budget}
                      onChange={(e) => setItineraryFormData({ ...itineraryFormData, budget: e.target.value })}
                      placeholder="e.g., 5000"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    Create Itinerary
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowItineraryDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </Dialog>
      )}
    </div>
  );
}
