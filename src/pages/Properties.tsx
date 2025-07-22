import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '@/components/common/SEO';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyFiltersComponent from '@/components/property/PropertyFilters';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useProperties } from '@/hooks/useProperties';
import type { PropertyFilters } from '@/types';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<PropertyFilters>({});

  // Initialize filters from URL params
  useEffect(() => {
    const initialFilters: PropertyFilters = {};
    
    if (searchParams.get('search')) {
      initialFilters.search = searchParams.get('search') || undefined;
    }
    if (searchParams.get('property_type')) {
      initialFilters.property_type = searchParams.get('property_type') as any;
    }
    if (searchParams.get('min_price')) {
      initialFilters.min_price = Number(searchParams.get('min_price'));
    }
    if (searchParams.get('max_price')) {
      initialFilters.max_price = Number(searchParams.get('max_price'));
    }
    if (searchParams.get('location')) {
      initialFilters.location = searchParams.get('location') || undefined;
    }
    if (searchParams.get('bedrooms')) {
      initialFilters.bedrooms = Number(searchParams.get('bedrooms'));
    }
    if (searchParams.get('bathrooms')) {
      initialFilters.bathrooms = Number(searchParams.get('bathrooms'));
    }
    if (searchParams.get('featured')) {
      initialFilters.featured = searchParams.get('featured') === 'true';
    }
    if (searchParams.get('developer_id')) {
      initialFilters.developer_id = searchParams.get('developer_id') || undefined;
    }

    setFilters(initialFilters);
  }, [searchParams]);

  const { properties, loading, error, meta } = useProperties(filters, currentPage, 12);

  const handleFiltersChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
    setSearchParams({});
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <SEO
        title="Properties for Sale in Kenya"
        description="Browse our extensive collection of properties for sale in Kenya. Find apartments, houses, and commercial properties in prime locations."
        keywords="properties for sale Kenya, real estate listings, apartments Nairobi, houses for sale"
      />

      <div className="min-h-screen bg-bg-primary py-6 sm:py-8">
        <div className="max-w-[1800px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4" style={{ color: '#181818' }}>
              Properties for Sale
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Discover your perfect property from our curated selection of premium real estate
            </p>
          </div>

          {/* Filters */}
          <PropertyFiltersComponent
            filters={filters}
            onChange={handleFiltersChange}
            onClear={handleClearFilters}
          />

          {/* Results Summary */}
          {!loading && (
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <p className="text-gray-600 text-sm sm:text-base">
                {meta.total > 0 ? (
                  <>
                    Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} properties
                  </>
                ) : (
                  'No properties found'
                )}
              </p>
              {meta.total > 0 && (
                <p className="text-xs sm:text-sm text-gray-500">
                  Page {meta.page} of {meta.totalPages}
                </p>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8 sm:py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600 text-sm sm:text-base">Loading properties...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8 sm:py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {/* Properties Grid */}
          {!loading && !error && properties.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 mb-8 sm:mb-12">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="text-xs sm:text-base px-3 sm:px-4 py-1 sm:py-2"
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        onClick={() => handlePageChange(page)}
                        className={page === currentPage ? "btn-primary text-xs sm:text-base px-3 sm:px-4 py-1 sm:py-2" : "text-xs sm:text-base px-3 sm:px-4 py-1 sm:py-2"}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === meta.totalPages}
                    className="text-xs sm:text-base px-3 sm:px-4 py-1 sm:py-2"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}

          {/* No Results */}
          {!loading && !error && properties.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No properties found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or browse all properties
              </p>
              <Button onClick={handleClearFilters} className="btn-secondary">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Properties;