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
      <section className="py-16 bg-white">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading featured properties...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 sm:py-10 bg-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');

        .font-luxury {
          font-family: 'Cinzel', serif;
        }
      `}</style>
      <div className="max-w-[1800px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-navy mb-2 sm:mb-4 font-luxury">
            Featured Properties
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto font-luxury">
            Discover our handpicked selection of premium properties in Africa's most desirable locations
          </p>
        </div>

        {/* Properties Grid */}
        {properties && properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-8 mb-6 sm:mb-8">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} featured />
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Link to="/properties">
                <Button size="lg" className="btn-primary px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto">
                  View All Properties
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <p className="text-gray-600 mb-4">No featured properties available at the moment.</p>
            <Link to="/properties">
              <Button className="btn-primary w-full sm:w-auto">Browse All Properties</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;