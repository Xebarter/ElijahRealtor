import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building, Edit, Trash2, Globe, Mail, Phone, MapPin, Search, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useDevelopers } from '@/hooks/useDevelopers';
import { COUNTRIES } from '@/lib/countries';
import toast from 'react-hot-toast';
import type { Developer } from '@/types';

const DeveloperManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [formData, setFormData] = useState<Partial<Developer>>({
    name: '',
    bio: '',
    contact_email: '',
    contact_phone: '',
    website_url: '',
    countries: []
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    developers, 
    loading, 
    error, 
    createDeveloper, 
    updateDeveloper, 
    deleteDeveloper,
    refetch 
  } = useDevelopers();

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const logoEditInputRef = useRef<HTMLInputElement | null>(null);

  const filteredDevelopers = developers.filter(developer => 
    developer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (developer.bio && developer.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (developer.countries && developer.countries.some(country => 
      country.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const handleAddDeveloper = () => {
    setFormData({
      name: '',
      bio: '',
      contact_email: '',
      contact_phone: '',
      website_url: '',
      countries: []
    });
    setLogoFile(null);
    setLogoPreview(null);
    setShowAddDialog(true);
  };

  const handleEditDeveloper = (developer: Developer) => {
    setSelectedDeveloper(developer);
    setFormData({
      name: developer.name,
      bio: developer.bio || '',
      contact_email: developer.contact_email || '',
      contact_phone: developer.contact_phone || '',
      website_url: developer.website_url || '',
      countries: developer.countries || []
    });
    setLogoPreview(developer.logo_url || null);
    setLogoFile(null);
    setShowEditDialog(true);
  };

  const handleConfirmDelete = (developer: Developer) => {
    setSelectedDeveloper(developer);
    setShowDeleteDialog(true);
  };

  const handleDeleteDeveloper = async () => {
    if (!selectedDeveloper) return;
    
    try {
      await deleteDeveloper(selectedDeveloper.id);
      toast.success('Developer deleted successfully');
      setShowDeleteDialog(false);
      setSelectedDeveloper(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete developer');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
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

  const handleSubmit = async (isEdit: boolean = false) => {
    if (!formData.name) {
      toast.error('Developer name is required');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      if (isEdit && selectedDeveloper) {
        await updateDeveloper(selectedDeveloper.id, formData, logoFile);
        toast.success('Developer updated successfully');
        setShowEditDialog(false);
      } else {
        await createDeveloper(formData, logoFile);
        toast.success('Developer created successfully');
        setShowAddDialog(false);
      }
      
      // Reset form
      setFormData({
        name: '',
        bio: '',
        contact_email: '',
        contact_phone: '',
        website_url: '',
        countries: []
      });
      setLogoFile(null);
      setLogoPreview(null);
      
      // Refresh developers list
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save developer');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-navy">Property Developers</h1>
          <p className="text-gray-600 mt-2">Manage property developers and their information</p>
        </div>
        <Button className="btn-primary" onClick={handleAddDeveloper}>
          <Plus className="w-4 h-4 mr-2" />
          Add Developer
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search developers by name, bio, or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developers List */}
      <Card>
        <CardHeader>
          <CardTitle>Developers ({filteredDevelopers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-96">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredDevelopers.length === 0 ? (
            <div className="text-center py-12">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No developers found</p>
              <Button className="mt-4" onClick={handleAddDeveloper}>
                Add Your First Developer
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevelopers.map((developer) => (
                <Card key={developer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      {developer.logo_url ? (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={developer.logo_url}
                            alt={developer.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/64?text=Logo';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-primary-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building className="w-8 h-8 text-primary-navy" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-primary-navy truncate">
                          {developer.name}
                        </h3>
                        {developer.website_url && (
                          <a 
                            href={developer.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary-gold flex items-center hover:underline"
                          >
                            <Globe className="w-3 h-3 mr-1" />
                            {developer.website_url.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                      </div>
                    </div>

                    {developer.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {developer.bio}
                      </p>
                    )}

                    {developer.countries && developer.countries.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 mb-1">Operating in:</div>
                        <div className="flex flex-wrap gap-1">
                          {developer.countries.map((country) => {
                            const countryData = COUNTRIES.find(c => c.name === country);
                            return (
                              <Badge key={country} variant="outline" className="text-xs">
                                {countryData?.flag || ''} {country}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      {developer.contact_email && (
                        <a 
                          href={`mailto:${developer.contact_email}`}
                          className="flex items-center hover:text-primary-gold"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Email
                        </a>
                      )}
                      {developer.contact_phone && (
                        <a 
                          href={`tel:${developer.contact_phone}`}
                          className="flex items-center hover:text-primary-gold"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </a>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDeveloper(developer)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirmDelete(developer)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Developer Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Developer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Developer Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Developer Logo
              </label>
              <div className="flex items-center space-x-4">
                {logoPreview ? (
                  <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    id="logo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoChange}
                    ref={logoInputRef}
                  />
                  <button
                    type="button"
                    className="btn-primary px-4 py-2 flex items-center cursor-pointer"
                    onClick={() => logoInputRef.current && logoInputRef.current.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {logoFile ? 'Change Logo' : 'Upload Logo'}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended size: 200x200px (Max 2MB)
                  </p>
                </div>
              </div>
            </div>

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
                      id={`country-${country.code}`}
                      checked={(formData.countries || []).includes(country.name)}
                      onChange={() => handleCountryChange(country.name)}
                      className="mr-2"
                    />
                    <label htmlFor={`country-${country.code}`} className="text-sm">
                      {country.flag} {country.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Progress */}
            {isSubmitting && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading logo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
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
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting || !formData.name}
              className="btn-primary"
            >
              {isSubmitting ? 'Saving...' : 'Save Developer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Developer Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Developer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Developer Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Developer Logo
              </label>
              <div className="flex items-center space-x-4">
                {logoPreview ? (
                  <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(selectedDeveloper?.logo_url || null);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    id="logo-upload-edit"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoChange}
                    ref={logoEditInputRef}
                  />
                  <button
                    type="button"
                    className="btn-primary px-4 py-2 flex items-center cursor-pointer"
                    onClick={() => logoEditInputRef.current && logoEditInputRef.current.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended size: 200x200px (Max 2MB)
                  </p>
                </div>
              </div>
            </div>

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
                      id={`country-edit-${country.code}`}
                      checked={(formData.countries || []).includes(country.name)}
                      onChange={() => handleCountryChange(country.name)}
                      className="mr-2"
                    />
                    <label htmlFor={`country-edit-${country.code}`} className="text-sm">
                      {country.flag} {country.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Progress */}
            {isSubmitting && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading logo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting || !formData.name}
              className="btn-primary"
            >
              {isSubmitting ? 'Saving...' : 'Update Developer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Developer</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete <strong>{selectedDeveloper?.name}</strong>? This action cannot be undone.
          </p>
          <Alert className="mt-4">
            <AlertDescription>
              Note: This will not delete properties associated with this developer. Those properties will no longer have a developer assigned.
            </AlertDescription>
          </Alert>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDeveloper}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeveloperManagement;