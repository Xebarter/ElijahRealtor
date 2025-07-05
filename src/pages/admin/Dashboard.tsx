import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Building, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  BarChart3,
  FileText,
  BookOpen,
  Plus,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useDashboardStats } from '@/hooks/useDashboard';
import { formatPrice } from '@/lib/countries';

const Dashboard = () => {
  const navigate = useNavigate();
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Failed to load dashboard'}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      icon: Building,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Listings',
      value: stats.activeListings,
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Bookings',
      value: stats.pendingBookings,
      icon: Calendar,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Financing Apps',
      value: stats.financingApplications,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'property_added':
        return Building;
      case 'booking_created':
        return Calendar;
      case 'application_submitted':
        return DollarSign;
      case 'property_sold':
        return BarChart3;
      case 'contact_received':
        return MessageSquare;
      default:
        return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'property_added':
        return 'text-blue-600';
      case 'booking_created':
        return 'text-yellow-600';
      case 'application_submitted':
        return 'text-purple-600';
      case 'property_sold':
        return 'text-green-600';
      case 'contact_received':
        return 'text-pink-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-navy">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your properties.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-primary-navy">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Properties by Country */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="w-5 h-5 mr-2 text-primary-gold" />
              Properties by Country
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.propertiesByCountry.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary-gold rounded-full mr-3"></div>
                    <span className="font-medium">{item.country}</span>
                  </div>
                  <Badge variant="secondary">{item.count} properties</Badge>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link to="/admin/properties">
                <Button variant="outline" className="w-full">
                  View All Properties
                  <Eye className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary-gold" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                const color = getActivityColor(activity.type);
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-gray-50`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                        {activity.country && (
                          <Badge variant="outline" className="text-xs">
                            {activity.country}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6">
              <Button variant="outline" className="w-full">
                View All Activity
                <Eye className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              className="w-full btn-primary"
              onClick={() => handleQuickAction('/admin/properties/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleQuickAction('/admin/visits')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              View Visits
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleQuickAction('/admin/financing')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Financing Apps
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleQuickAction('/admin/messages')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {formatPrice(stats.monthlyRevenue, 'USD')}
            </div>
            <p className="text-sm text-gray-600">Monthly Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {stats.conversionRate}%
            </div>
            <p className="text-sm text-gray-600">Conversion Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {stats.soldProperties}
            </div>
            <p className="text-sm text-gray-600">Properties Sold</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;