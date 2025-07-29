import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/property/PropertyCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useFeaturedProperties } from '@/hooks/useProperties';

const FeaturedProperties = () => {
  const { properties, loading, error } = useFeaturedProperties(6);

  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600 text-xs sm:text-sm font-luxury clamp-text">Loading featured properties...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600 text-xs sm:text-sm font-luxury clamp-text">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 sm:py-10 md:py-16 bg-white overflow-x-hidden font-luxury">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-navy mb-2 sm:mb-3 clamp-text">
            Featured Properties
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-xl mx-auto clamp-text leading-relaxed">
            Discover our handpicked selection of premium properties in Africa's most desirable locations
          </p>
        </div>

        {/* Properties Grid */}
        {properties && properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-10">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} featured />
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Link to="/properties">
                <Button 
                  size="lg" 
                  className="bg-[#151f28] text-[#ffd51e] hover:bg-[#122330] hover:text-[#ffd51e] transition-all duration-300 px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto border border-red-500 hover:border-red-600 rounded-lg"
                >
                  View All Properties
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-6 sm:py-8 md:py-10">
            <p className="text-gray-600 mb-2 sm:mb-3 text-xs sm:text-sm md:text-base clamp-text">
              No featured properties available at the moment.
            </p>
            <Link to="/properties">
              <Button className="btn-primary w-full sm:w-auto px-2 xs:px-3 sm:px-6 py-1 xs:py-2 sm:py-3 font-luxury clamp-text text-sm xs:text-base">
                Browse All Properties
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;