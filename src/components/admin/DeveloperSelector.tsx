import React, { useState } from 'react';
import { Building, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useDevelopers } from '@/hooks/useDevelopers';
import { COUNTRIES } from '@/lib/countries';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import type { Developer } from '@/types';

interface DeveloperSelectorProps {
  selectedDeveloperId?: string;
  onSelect: (developerId: string | undefined) => void;
}

const DeveloperSelector: React.FC<DeveloperSelectorProps> = ({
  selectedDeveloperId,
  onSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<Developer>>({
    name: '',
    bio: '',
    contact_email: '',
    contact_phone: '',
    website_url: '',
    countries: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    developers, 
    loading, 
    error, 
    createDeveloper,
    refetch 
  } = useDevelopers();

  const filteredDevelopers = developers.filter(developer => 
    developer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDeveloper = developers.find(dev => dev.id === selectedDeveloperId);

  const handleAddDeveloper = () => {
    setFormData({
      name: '',
      bio: '',
      contact_email: '',
      contact_phone: '',
      website_url: '',
      countries: []
    });
    setShowAddDialog(true);
  };

  const handleCountryChange = (country: string) => {
    setFormData(prev => {
      const currentCountries = prev.countries || [];
      if (currentCountries.includes(country)) {
        return {
          ...prev,
          countries: currentCountries.filter(c => c !== country)
        };
      } else {
        return {
          ...prev,
          countries: [...currentCountries, country]
        };
      }
    });
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Developer name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const newDeveloper = await createDeveloper(formData);
      toast.success('Developer created successfully');
      setShowAddDialog(false);
      
      // Reset form
      setFormData({
        name: '',
        bio: '',
        contact_email: '',
        contact_phone: '',
        website_url: '',
        countries: []
      });
      
      // Refresh developers list and select the new one
      await refetch();
      onSelect(newDeveloper.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create developer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Developer
      </label>
      
      {selectedDeveloper ? (
        <div className="flex items-center space-x-3 p-3 border rounded-md">
          {selectedDeveloper.logo_url ? (
            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
              <img
                src={selectedDeveloper.logo_url}
                alt={selectedDeveloper.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/40?text=Logo';
                }}
              />
            </div>
          ) : (
            <div className="w-10 h-10 bg-primary-navy/10 rounded flex items-center justify-center">
              <Building className="w-5 h-5 text-primary-navy" />
            </div>
          )}
          <div className="flex-1">
            <div className="font-medium">{selectedDeveloper.name}</div>
            {selectedDeveloper.countries && selectedDeveloper.countries.length > 0 && (
              <div className="text-xs text-gray-500">
                Operating in: {selectedDeveloper.countries.join(', ')}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect(undefined)}
            className="text-gray-500"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search developers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleAddDeveloper}
            >
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
          </div>
          
          <div className="border rounded-md max-h-60 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : error ? (
              <div className="text-center p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            ) : filteredDevelopers.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-gray-500 text-sm">No developers found</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleAddDeveloper}
                  className="mt-1"
                >
                  Add a new developer
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {filteredDevelopers.map((developer) => (
                  <div
                    key={developer.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
                    onClick={() => onSelect(developer.id)}
                  >
                    {developer.logo_url ? (
                      <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden">
                        <img
                          src={developer.logo_url}
                          alt={developer.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/32?text=Logo';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-primary-navy/10 rounded flex items-center justify-center">
                        <Building className="w-4 h-4 text-primary-navy" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{developer.name}</div>
                      {developer.countries && developer.countries.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {developer.countries.slice(0, 2).join(', ')}
                          {developer.countries.length > 2 && ` +${developer.countries.length - 2} more`}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Developer Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Developer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Developer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Developer Name *
              </label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter developer name"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <Textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief description of the developer"
                rows={3}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <Input
                  type="email"
                  value={formData.contact_email || ''}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <Input
                  value={formData.contact_phone || ''}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+254 700 123 456"
                />
              </div>
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website URL
              </label>
              <Input
                type="url"
                value={formData.website_url || ''}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            {/* Countries */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operating Countries
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {COUNTRIES.map((country) => (
                  <div key={country.code} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`country-quick-${country.code}`}
                      checked={(formData.countries || []).includes(country.name)}
                      onChange={() => handleCountryChange(country.name)}
                      className="mr-2"
                    />
                    <label htmlFor={`country-quick-${country.code}`} className="text-sm">
                      {country.flag} {country.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name}
              className="btn-primary"
            >
              {isSubmitting ? 'Saving...' : 'Save Developer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeveloperSelector;