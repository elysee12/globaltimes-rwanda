import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { announcementsAPI, Announcement } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { uploadAPI } from "@/lib/api";

const ManageAnnouncements = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    titleEN: "",
    titleRW: "",
    titleFR: "",
    descriptionEN: "",
    descriptionRW: "",
    descriptionFR: "",
    image: "",
    video: "",
    file: "",
    fileName: "",
    fileType: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeLanguageTab, setActiveLanguageTab] = useState<'EN' | 'RW' | 'FR'>('EN');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementsAPI.getAll();
      setAnnouncements(data);
    } catch (error) {
      toast.error("Failed to load announcements");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Accept both images and other files
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }
      setSelectedImageFile(file);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error("Please select a valid video file");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Video size must be less than 20MB");
        return;
      }
      setSelectedVideoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let imageUrl = formData.image;
      let videoUrl = formData.video;
      let fileUrl = formData.file;
      let fileName = formData.fileName;
      let fileType = formData.fileType;

      if (selectedImageFile) {
        const uploaded = await uploadAPI.uploadFile(selectedImageFile);
        // Check if it's an image or a file
        if (selectedImageFile.type.startsWith('image/')) {
          // It's an image, store in image field
          imageUrl = uploaded.url;
          // Clear file fields if it's an image
          fileUrl = undefined;
          fileName = undefined;
          fileType = undefined;
        } else {
          // It's a file, store in file fields
          fileUrl = uploaded.url;
          fileName = selectedImageFile.name;
          fileType = selectedImageFile.type || selectedImageFile.name.split('.').pop()?.toLowerCase() || '';
          // Clear image field if it's a file
          imageUrl = undefined;
        }
      }

      if (selectedVideoFile) {
        const uploaded = await uploadAPI.uploadFile(selectedVideoFile);
        videoUrl = uploaded.url;
      }
      
      const announcementData = {
        titleEN: formData.titleEN,
        titleRW: formData.titleRW,
        titleFR: formData.titleFR,
        descriptionEN: formData.descriptionEN,
        descriptionRW: formData.descriptionRW,
        descriptionFR: formData.descriptionFR,
        image: imageUrl || undefined,
        video: videoUrl || undefined,
        file: fileUrl || undefined,
        fileName: fileName || undefined,
        fileType: fileType || undefined,
      };

      if (editingId !== null) {
        await announcementsAPI.update(editingId, announcementData);
        toast.success("Announcement updated successfully");
      } else {
        await announcementsAPI.create(announcementData);
        toast.success("Announcement created successfully");
      }

      resetForm();
      fetchAnnouncements();
    } catch (error) {
      toast.error("Error saving announcement");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titleEN: "",
      titleRW: "",
      titleFR: "",
      descriptionEN: "",
      descriptionRW: "",
      descriptionFR: "",
      image: "",
      video: "",
      file: "",
      fileName: "",
      fileType: "",
    });
    setEditingId(null);
    setSelectedImageFile(null);
    setSelectedVideoFile(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleEdit = (id: number) => {
    const announcement = announcements.find(a => a.id === id);
    if (announcement) {
      setFormData({
        titleEN: announcement.titleEN,
        titleRW: announcement.titleRW,
        titleFR: announcement.titleFR,
        descriptionEN: announcement.descriptionEN,
        descriptionRW: announcement.descriptionRW,
        descriptionFR: announcement.descriptionFR,
        image: announcement.image || "",
        video: announcement.video || "",
        file: announcement.file || "",
        fileName: announcement.fileName || "",
        fileType: announcement.fileType || "",
      });
      setEditingId(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      try {
        await announcementsAPI.delete(id);
        toast.success("Announcement deleted successfully");
        fetchAnnouncements();
      } catch (error) {
        toast.error("Failed to delete announcement");
        console.error(error);
      }
    }
  };

  const getTitleForLanguage = (announcement: Announcement) => {
    switch (language) {
      case "RW":
        return announcement.titleRW;
      case "FR":
        return announcement.titleFR;
      case "EN":
      default:
        return announcement.titleEN;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="outline" onClick={() => navigate("/admin")} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
          </Button>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingId ? "Edit Announcement" : "Add New Announcement"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs value={activeLanguageTab} onValueChange={(value) => setActiveLanguageTab(value as 'EN' | 'RW' | 'FR')} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="EN">English</TabsTrigger>
                    <TabsTrigger value="RW">Kinyarwanda</TabsTrigger>
                    <TabsTrigger value="FR">French</TabsTrigger>
                  </TabsList>

                  <TabsContent value="EN" className="space-y-4 mt-4">
                    <div>
                      <Label>Title (English)</Label>
                      <Input value={formData.titleEN} onChange={(e) => setFormData({...formData, titleEN: e.target.value})} required placeholder="Enter title in English" />
                    </div>
                    <div>
                      <Label>Description (English)</Label>
                      <Textarea value={formData.descriptionEN} onChange={(e) => setFormData({...formData, descriptionEN: e.target.value})} required placeholder="Enter description in English" rows={6} />
                    </div>
                  </TabsContent>

                  <TabsContent value="RW" className="space-y-4 mt-4">
                    <div>
                      <Label>Title (Kinyarwanda)</Label>
                      <Input value={formData.titleRW} onChange={(e) => setFormData({...formData, titleRW: e.target.value})} required placeholder="Andika umutwe mu Kinyarwanda" />
                    </div>
                    <div>
                      <Label>Description (Kinyarwanda)</Label>
                      <Textarea value={formData.descriptionRW} onChange={(e) => setFormData({...formData, descriptionRW: e.target.value})} required placeholder="Andika incamake mu Kinyarwanda" rows={6} />
                    </div>
                  </TabsContent>

                  <TabsContent value="FR" className="space-y-4 mt-4">
                    <div>
                      <Label>Title (French)</Label>
                      <Input value={formData.titleFR} onChange={(e) => setFormData({...formData, titleFR: e.target.value})} required placeholder="Entrez le titre en français" />
                    </div>
                    <div>
                      <Label>Description (French)</Label>
                      <Textarea value={formData.descriptionFR} onChange={(e) => setFormData({...formData, descriptionFR: e.target.value})} required placeholder="Entrez la description en français" rows={6} />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold">Media & Files</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Image or File (Optional)</Label>
                      <Input ref={imageInputRef} type="file" onChange={handleImageSelect} />
                      {selectedImageFile && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">Selected: {selectedImageFile.name}</p>
                          {selectedImageFile.type.startsWith('image/') && (
                            <p className="text-xs text-muted-foreground">Will be displayed as image</p>
                          )}
                          {!selectedImageFile.type.startsWith('image/') && (
                            <p className="text-xs text-muted-foreground">Will be available for download</p>
                          )}
                        </div>
                      )}
                      {formData.image && !selectedImageFile && (
                        <div className="mt-2">
                          <img src={formData.image} alt="Preview" className="h-20 w-20 object-cover rounded" />
                          <p className="text-xs text-muted-foreground mt-1">Current image</p>
                        </div>
                      )}
                      {formData.file && !selectedImageFile && !formData.image && (
                        <div className="mt-2 p-2 border rounded bg-muted">
                          <p className="text-sm font-medium">{formData.fileName || "Attached file"}</p>
                          <a href={formData.file} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                            View/Download
                          </a>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Video (Optional)</Label>
                      <Input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoSelect} />
                      {selectedVideoFile && <p className="text-sm text-muted-foreground mt-1">Selected: {selectedVideoFile.name}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isUploading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isUploading ? "Saving..." : editingId ? "Update Announcement" : "Add Announcement"}
                  </Button>
                  {editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Announcements ({announcements.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading announcements...</p>
              ) : (
                <div className="space-y-4">
                  {announcements.map(announcement => (
                    <div key={announcement.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{getTitleForLanguage(announcement)}</h3>
                        <p className="text-sm text-muted-foreground">{new Date(announcement.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(announcement.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(announcement.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No announcements yet. Add your first announcement above.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ManageAnnouncements;

