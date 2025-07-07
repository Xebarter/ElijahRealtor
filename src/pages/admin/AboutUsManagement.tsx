import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const SECTIONS = [
  { id: 'sales', label: 'Property Sales' },
  { id: 'management', label: 'Property Management' },
  { id: 'advisory', label: 'Investment Advisory' },
  { id: 'valuation', label: 'Property Valuation' },
];

const initialState = SECTIONS.reduce((acc, s) => {
  acc[s.id] = { content: '', image_url: '', imageFile: null };
  return acc;
}, {} as Record<string, { content: string; image_url: string; imageFile: File | null }>);

const AboutUsManagement = () => {
  const [sections, setSections] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('about_us').select('*');
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else if (data) {
        const newSections = { ...initialState };
        data.forEach((row: any) => {
          newSections[row.section] = { content: row.content || '', image_url: row.image_url || '', imageFile: null };
        });
        setSections(newSections);
      }
      setLoading(false);
    };
    fetchSections();
    // eslint-disable-next-line
  }, []);

  const handleContentChange = (sectionId: string, value: string) => {
    setSections((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], content: value },
    }));
  };

  const handleImageChange = (sectionId: string, file: File | null) => {
    setSections((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], imageFile: file },
    }));
  };

  const handleSave = async (sectionId: string) => {
    setLoading(true);
    const { content, imageFile } = sections[sectionId];
    let image_url = sections[sectionId].image_url;

    // Upload image if new file selected
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `about_us/${sectionId}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('aboutus').upload(filePath, imageFile, { upsert: true });
      if (uploadError) {
        toast({ title: 'Image Upload Error', description: uploadError.message, variant: 'destructive' });
        setLoading(false);
        return;
      }
      image_url = supabase.storage.from('aboutus').getPublicUrl(filePath).data.publicUrl;
    }

    // Upsert content
    const { error } = await supabase.from('about_us').upsert({
      section: sectionId,
      content,
      image_url,
    }, { onConflict: 'section' });
    if (error) {
      toast({ title: 'Save Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: `${SECTIONS.find(s => s.id === sectionId)?.label} updated.` });
      setSections((prev) => ({
        ...prev,
        [sectionId]: { ...prev[sectionId], image_url, imageFile: null },
      }));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">Edit About Us Page</h1>
      {SECTIONS.map((section) => (
        <Card key={section.id} className="mb-8">
          <CardHeader>
            <h2 className="text-lg font-semibold">{section.label}</h2>
          </CardHeader>
          <CardContent>
            <label className="block mb-2 font-medium">Section Content</label>
            <ReactQuill
              value={sections[section.id].content}
              onChange={(value) => handleContentChange(section.id, value)}
              theme="snow"
              className="mb-4 bg-white"
            />
            <label className="block mb-2 font-medium">Section Image</label>
            {sections[section.id].image_url && (
              <img src={sections[section.id].image_url} alt="Section" className="w-40 h-32 object-cover rounded mb-2" />
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(section.id, e.target.files?.[0] || null)}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleSave(section.id)} disabled={loading}>
              Save {section.label}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default AboutUsManagement; 