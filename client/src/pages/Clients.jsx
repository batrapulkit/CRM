// client/src/pages/Clients.jsx
import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog } from '../components/ui/dialog';
import { 
  Plus, Search, Mail, Phone, Building, MapPin, 
  Users, TrendingUp, Edit, Trash2, Eye, FileText, X
} from 'lucide-react';
import api from '../api/client';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showItinerariesModal, setShowItinerariesModal] = useState(false);
  const [clientItineraries, setClientItineraries] = useState([]);
  const [loadingItineraries, setLoadingItineraries] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    new_this_month: 0
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    country: '',
    notes: ''
  });

  useEffect(() => {
    fetchClients();
    fetchStats();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchTerm, clients]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clients');
      setClients(response.data.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      alert('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('[CLIENTS] Fetching stats...');
      const response = await api.get('/clients/stats');
      console.log('[CLIENTS] Stats response:', JSON.stringify(response.data, null, 2));
      
      // Handle both nested and flat stats structure
      const statsData = response.data.stats;
      if (statsData.clients) {
        // Nested structure from backend
        setStats({
          total: statsData.clients.total || 0,
          active: statsData.clients.active || 0,
          inactive: (statsData.clients.total || 0) - (statsData.clients.active || 0),
          new_this_month: statsData.clients.new_this_month || 0
        });
      } else {
        // Flat structure
        setStats(statsData);
      }
      console.log('[CLIENTS] Stats set successfully');
    } catch (error) {
      console.error('[CLIENTS] Error fetching stats:', error);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      alert('Name and email are required');
      return;
    }

    try {
      if (selectedClient) {
        // Update existing client
        await api.put(`/clients/${selectedClient.id}`, formData);
        alert('Client updated successfully!');
      } else {
        // Create new client
        await api.post('/clients', formData);
        alert('Client created successfully!');
      }

      setShowAddDialog(false);
      setSelectedClient(null);
      resetForm();
      fetchClients();
      fetchStats();
    } catch (error) {
      console.error('Error saving client:', error);
      alert(error.response?.data?.error || 'Failed to save client');
    }
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      company: client.company || '',
      address: client.address || '',
      city: client.city || '',
      country: client.country || '',
      notes: client.notes || ''
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (clientId) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      await api.delete(`/clients/${clientId}`);
      alert('Client deleted successfully!');
      fetchClients();
      fetchStats();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert(error.response?.data?.error || 'Failed to delete client');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      city: '',
      country: '',
      notes: ''
    });
  };

  const openAddDialog = () => {
    setSelectedClient(null);
    resetForm();
    setShowAddDialog(true);
  };

  const handleViewItineraries = async (client) => {
    console.log('[CLIENTS] Viewing itineraries for client:', client.id, client.name);
    setSelectedClient(client);
    setShowItinerariesModal(true);
    setLoadingItineraries(true);
    try {
      console.log('[CLIENTS] Fetching itineraries with client_id:', client.id);
      const response = await api.get(`/itineraries?client_id=${client.id}`);
      console.log('[CLIENTS] Received itineraries:', response.data.itineraries?.length || 0);
      console.log('[CLIENTS] Itineraries data:', JSON.stringify(response.data.itineraries, null, 2));
      setClientItineraries(response.data.itineraries || []);
    } catch (error) {
      console.error('[CLIENTS] Error fetching client itineraries:', error.message, error);
      setClientItineraries([]);
    } finally {
      setLoadingItineraries(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-gray-600">Manage your client relationships</p>
        </div>
        <Button onClick={openAddDialog} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            </div>
            <Users className="w-8 h-8 text-gray-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-purple-600">{stats.new_this_month}</p>
            </div>
            <Plus className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
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
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading clients...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first client'}
            </p>
            {!searchTerm && (
              <Button onClick={openAddDialog}>Add Your First Client</Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">Company</th>
                  <th className="text-left py-3 px-4">Location</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{client.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {client.email}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {client.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {client.phone}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {client.company ? (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          {client.company}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {client.city || client.country ? (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {[client.city, client.country].filter(Boolean).join(', ')}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        client.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewItineraries(client)}
                          title="View Itineraries"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(client)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(client.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Client Dialog */}
      {showAddDialog && (
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-6">
                {selectedClient ? 'Edit Client' : 'Add New Client'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows="3"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {selectedClient ? 'Update Client' : 'Add Client'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddDialog(false);
                      setSelectedClient(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </Dialog>
      )}

      {/* View Itineraries Modal */}
      {showItinerariesModal && selectedClient && (
        <Dialog open={showItinerariesModal} onOpenChange={setShowItinerariesModal}>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Itineraries for {selectedClient.name}</h2>
                  <p className="text-gray-600 text-sm mt-1">{selectedClient.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowItinerariesModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {loadingItineraries ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading itineraries...</p>
                </div>
              ) : clientItineraries.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No itineraries yet</h3>
                  <p className="text-gray-600">Create an itinerary and link it to this client</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientItineraries.map((itinerary) => (
                    <div
                      key={itinerary.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{itinerary.title || itinerary.destination}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            {itinerary.destination && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {itinerary.destination}
                              </div>
                            )}
                            {itinerary.duration && (
                              <div className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                {itinerary.duration} days
                              </div>
                            )}
                            {itinerary.travelers && (
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {itinerary.travelers} travelers
                              </div>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          itinerary.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          itinerary.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {itinerary.status || 'draft'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </Dialog>
      )}
    </div>
  );
}