import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from '../../hooks/use-toast';

interface HeroImage {
  id: string;
  image_url: string;
  caption: string | null;
  order: number;
}

const BUCKET = 'hero-images';

const HeroImagesManagement: React.FC = () => {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0); // percent (0-100)

  // Fetch images from Supabase
  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hero_images')
      .select('*')
      .order('order', { ascending: true });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else setImages(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchImages(); }, []);

  // Upload multiple images
  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setUploadProgress(0);
    let successCount = 0;
    let failCount = 0;
    await Promise.all(files.map(async (file, i) => {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}_${i}.${ext}`;
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, file);
      if (uploadError) {
        toast({ title: `Upload Error: ${file.name}`, description: uploadError.message, variant: 'destructive' });
        failCount++;
      } else {
        const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl;
        const { error: insertError } = await supabase.from('hero_images').insert({
          image_url: publicUrl,
          caption,
          order: images.length + i,
        });
        if (insertError) {
          toast({ title: `DB Error: ${file.name}`, description: insertError.message, variant: 'destructive' });
          failCount++;
        } else {
          toast({ title: `Uploaded: ${file.name}` });
          successCount++;
        }
      }
      // Update progress after each file
      setUploadProgress(Math.round(((successCount + failCount) / files.length) * 100));
    }));
    setFiles([]); setCaption(''); setUploading(false); setUploadProgress(0);
    fetchImages();
    if (successCount)
      toast({ title: `Upload complete`, description: `${successCount} image(s) uploaded successfully.` });
    if (failCount)
      toast({ title: `Upload failed`, description: `${failCount} image(s) failed to upload.`, variant: 'destructive' });
  };

  // Delete image
  const handleDelete = async (img: HeroImage) => {
    if (!window.confirm('Delete this image?')) return;
    // Remove from storage
    const path = img.image_url.split(`/${BUCKET}/`)[1];
    if (path) await supabase.storage.from(BUCKET).remove([path]);
    // Remove from table
    await supabase.from('hero_images').delete().eq('id', img.id);
    fetchImages();
  };

  // Update caption
  const handleCaptionChange = async (id: string, newCaption: string) => {
    await supabase.from('hero_images').update({ caption: newCaption }).eq('id', id);
    fetchImages();
  };

  // Reorder images
  const moveImage = async (from: number, to: number) => {
    if (from === to || to < 0 || to >= images.length) return;
    const reordered = [...images];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    // Update order in DB
    await Promise.all(
      reordered.map((img, idx) =>
        supabase.from('hero_images').update({ order: idx }).eq('id', img.id)
      )
    );
    fetchImages();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Hero Images Management</h1>
      <div className="mb-6 flex flex-col gap-2">
        {uploading && (
          <div className="w-full h-3 bg-gray-200 rounded overflow-hidden mb-2">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
        <div className="flex gap-2 items-end">
          <Input type="file" accept="image/*" multiple onChange={e => setFiles(Array.from(e.target.files || []))} />
          <Input placeholder="Caption (optional)" value={caption} onChange={e => setCaption(e.target.value)} />
          <Button onClick={handleUpload} disabled={uploading || !files.length}>{uploading ? 'Uploading...' : 'Upload'}</Button>
        </div>
      </div>
      {loading ? <div>Loading...</div> : (
        <ul className="space-y-4">
          {images.map((img, idx) => (
            <li key={img.id} className="flex items-center gap-4 bg-white rounded shadow p-2">
              <img src={img.image_url} alt="hero" className="w-32 h-20 object-cover rounded" />
              <Input
                className="flex-1"
                value={img.caption || ''}
                onChange={e => handleCaptionChange(img.id, e.target.value)}
                placeholder="Caption"
              />
              <Button variant="destructive" onClick={() => handleDelete(img)}>Delete</Button>
              <div className="flex flex-col gap-1">
                <Button size="icon" onClick={() => moveImage(idx, idx - 1)} disabled={idx === 0}>↑</Button>
                <Button size="icon" onClick={() => moveImage(idx, idx + 1)} disabled={idx === images.length - 1}>↓</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HeroImagesManagement; 