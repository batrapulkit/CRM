// client/src/pages/Dashboard.jsx

import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import {
  Users, DollarSign, FileText, Calendar, MapPin, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    clients: { total: 0, active: 0, new_this_month: 0 },
    itineraries: { total: 0, draft: 0, confirmed: 0 },
    revenue: { total: 0, this_month: 0 },
    bookings: { total: 0, pending: 0 }
  });

  const [recentClients, setRecentClients] = useState([]);
  const [recentItineraries, setRecentItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [clientsRes, itinerariesRes, clientStatsRes] = await Promise.all([
        api.get('/clients'),
        api.get('/itineraries?limit=5'),
        api.get('/clients/stats')
      ]);

      // Correct mapping based on backend response
      const allClients = clientsRes.data.clients || [];
      const allItineraries = itinerariesRes.data.itineraries || [];
      const statsData = clientStatsRes.data.stats || {};

      setRecentClients(allClients.slice(0, 5));
      setRecentItineraries(allItineraries.slice(0, 5));

      setStats({
        clients: {
          total: statsData.clients?.total || allClients.length || 0,
          active: statsData.clients?.active || 0,
          new_this_month: statsData.clients?.new_this_month || 0
        },
        itineraries: {
          total: allItineraries.length || 0,
          draft: allItineraries.filter(i => i.status === 'draft').length || 0,
          confirmed: allItineraries.filter(i => i.status === 'confirmed').length || 0
        },
        revenue: { total: 0, this_month: 0 },
        bookings: { total: 0, pending: 0 }
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/clients')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Clients</p>
              <p className="text-3xl font-bold">{stats.clients.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/itineraries')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Itineraries</p>
              <p className="text-3xl font-bold">{stats.itineraries.total}</p>
              <p className="text-xs text-gray-600 mt-1">
                {stats.itineraries.draft} draft, {stats.itineraries.confirmed} confirmed
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Revenue</p>
              <p className="text-3xl font-bold">$0</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/bookings')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Bookings</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Clients */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Clients</h2>
          <button onClick={() => navigate('/clients')} className="text-sm text-blue-600 hover:underline">
            View All
          </button>
        </div>

        {recentClients.length === 0 ? (
          <p className="text-gray-600">No clients yet</p>
        ) : (
          <div className="space-y-3">
            {recentClients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate('/clients')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{client.full_name}</p>
                    <p className="text-sm text-gray-600">{client.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Itineraries */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Itineraries</h2>
          <button onClick={() => navigate('/itineraries')} className="text-sm text-blue-600 hover:underline">
            View All
          </button>
        </div>

        {recentItineraries.length === 0 ? (
          <p className="text-gray-600">No itineraries yet</p>
        ) : (
          <div className="space-y-3">
            {recentItineraries.map((itinerary) => (
              <div
                key={itinerary.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate('/itineraries')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">{itinerary.destination}</p>
                    <p className="text-sm text-gray-600">{itinerary.duration} days</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                  {itinerary.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
