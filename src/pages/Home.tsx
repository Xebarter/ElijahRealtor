import SEO from '@/components/common/SEO';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import DevelopersSection from '@/components/home/DevelopersSection';
import ServicesSection from '@/components/home/ServicesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';

const Home = () => {
  return (
    <>
      <SEO
        title="Premium Real Estate in Africa"
        description="Find your dream property with ElijahRealtor. We specialize in luxury residential and commercial real estate in Kenya's most prestigious locations."
        keywords="real estate Kenya, properties Nairobi, luxury homes, apartments for sale, commercial property"
      />
      
      <div className="animate-fade-in">
        <HeroSection />
        <FeaturedProperties />
        <DevelopersSection />
        <ServicesSection />
        <TestimonialsSection />
      </div>
    </>
  );
};

export default Home;