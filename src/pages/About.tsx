import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const services = [
  { id: 'sales', title: 'Property Sales' },
  { id: 'management', title: 'Property Management' },
  { id: 'advisory', title: 'Investment Advisory' },
  { id: 'valuation', title: 'Property Valuation' },
];

const fallbackContent = {
  sales: {
    content: 'We help you buy and sell residential and commercial properties with expert guidance, market analysis, and a seamless transaction process.',
    image_url: '',
  },
  management: {
    content: 'Our property management team ensures your investment is well-maintained, tenants are satisfied, and your returns are maximized.',
    image_url: '',
  },
  advisory: {
    content: 'Get personalized real estate investment advice, portfolio planning, and risk assessment from our experienced advisors.',
    image_url: '',
  },
  valuation: {
    content: 'We provide accurate, market-driven property valuations for sales, purchases, insurance, and legal purposes.',
    image_url: '',
  },
};

const About = () => {
  const [sections, setSections] = useState<Record<string, { content: string; image_url: string }>>(fallbackContent);

  useEffect(() => {
    const fetchSections = async () => {
      const { data } = await supabase.from('about_us').select('*');
      if (data) {
        const newSections = { ...fallbackContent };
        data.forEach((row: any) => {
          newSections[row.section] = {
            content: row.content || fallbackContent[row.section].content,
            image_url: row.image_url || '',
          };
        });
        setSections(newSections);
      }
    };
    fetchSections();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-primary-navy text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">About ElijahRealtor</h1>
        <p className="max-w-2xl mx-auto text-lg mb-6">
          ElijahRealtor is your trusted partner for luxury real estate across Africa. We are committed to delivering exceptional service, expert advice, and a seamless experience for buyers, sellers, and investors alike.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {services.map((service) => (
            <a
              key={service.id}
              href={`#${service.id}`}
              className="bg-primary-gold text-primary-navy px-6 py-2 rounded-full font-semibold shadow hover:bg-yellow-400 transition-colors"
            >
              {service.title}
            </a>
          ))}
        </div>
      </section>

      {/* Services Sections */}
      <section className="max-w-4xl mx-auto py-16 px-4 space-y-16">
        {services.map((service) => (
          <div key={service.id} id={service.id} className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-primary-navy mb-2 flex items-center gap-2">
              {service.title}
              <span className="text-primary-gold text-lg">#</span>
            </h2>
            {sections[service.id].image_url && (
              <img src={sections[service.id].image_url} alt={service.title} className="w-full max-w-md rounded-lg mb-4" />
            )}
            <div className="prose prose-lg max-w-none mb-4" dangerouslySetInnerHTML={{ __html: (sections as Record<string, { content: string; image_url: string }>)[service.id].content }} />
            <a
              href="#top"
              className="text-primary-gold hover:underline text-sm"
            >
              Back to top
            </a>
          </div>
        ))}
      </section>
    </div>
  );
};

export default About; 