import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { COUNTRIES } from '@/lib/countries';
import type { PropertyFilters } from '@/types';

interface PropertyFiltersProps {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  onClear: () => void;
}

const PropertyFiltersComponent: React.FC<PropertyFiltersProps> = ({
  filters,
  onChange,
  onClear,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleInputChange = (key: keyof PropertyFilters, value: any) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        {/* Search Bar - Always Visible */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search properties by title, location, city, or country..."
              className="pl-10"
              value={filters.search || ''}
              onChange={(e) => handleInputChange('search', e.target.value)}
            />
          </div>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-primary-gold text-primary-navy text-xs px-1.5 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type
                  </label>
                  <Select
                    value={filters.property_type || 'all'}
                    onValueChange={(value) => handleInputChange('property_type', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Type</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <Select
                    value={filters.country || 'all'}
                    onValueChange={(value) => handleInputChange('country', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Country</SelectItem>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          {country.flag} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <Input
                    placeholder="Any City"
                    value={filters.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value || undefined)}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area/Location
                  </label>
                  <Input
                    placeholder="Any Area"
                    value={filters.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value || undefined)}
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price
                  </label>
                  <Input
                    type="number"
                    placeholder="Min Price"
                    value={filters.min_price || ''}
                    onChange={(e) => handleInputChange('min_price', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price
                  </label>
                  <Input
                    type="number"
                    placeholder="Max Price"
                    value={filters.max_price || ''}
                    onChange={(e) => handleInputChange('max_price', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Bedrooms
                  </label>
                  <Select
                    value={filters.bedrooms?.toString() || 'all'}
                    onValueChange={(value) => handleInputChange('bedrooms', value === 'all' ? undefined : Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Bathrooms
                  </label>
                  <Select
                    value={filters.bathrooms?.toString() || 'all'}
                    onValueChange={(value) => handleInputChange('bathrooms', value === 'all' ? undefined : Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Featured Only */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={filters.featured || false}
                    onChange={(e) => handleInputChange('featured', e.target.checked || undefined)}
                    className="mr-2"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                    Featured Properties Only
                  </label>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={onClear}
                      className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyFiltersComponent;