import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { mediaAPI, MediaItem, uploadAPI } from "@/lib/api";

const ManageMedia = () => {
  const navigate = useNavigate();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [mediaName, setMediaName] = useState("");
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMediaItems = async () => {
    try {
      setLoading(true);
      const data = await mediaAPI.getAll();
      setMediaItems(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load media library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaItems();
  }, []);

  const resetForm = () => {
    setMediaName("");
    setMediaType("image");
    setSelectedFile(null);
    setEditingMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes =
      mediaType === "image"
        ? ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        : ["video/mp4", "video/webm", "video/ogg"];
      
      if (!validTypes.includes(file.type)) {
        toast.error(`Please select a valid ${mediaType} file`);
        return;
      }

    // 20MB limit for videos, 10MB for images
    const sizeLimit = mediaType === "image" ? 10 : 50;
    if (file.size > sizeLimit * 1024 * 1024) {
      toast.error(`File size must be less than ${sizeLimit}MB`);
        return;
      }

      setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaName) {
      toast.error("Please enter a media name");
      return;
    }

    if (!editingMedia && !selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      let url = editingMedia?.url || "";
      let size = editingMedia?.size;
      let mimeType = editingMedia?.mimeType;

      if (selectedFile) {
        const uploaded = await uploadAPI.uploadFile(selectedFile);
        url = uploaded.url;
        size = selectedFile.size;
        mimeType = selectedFile.type;
      }

      if (editingMedia) {
        await mediaAPI.update(editingMedia.id, {
          name: mediaName,
          type: mediaType,
          url,
          size,
          mimeType,
        });
        toast.success("Media updated");
      } else {
        await mediaAPI.create({
          name: mediaName,
          type: mediaType,
          url,
          size,
          mimeType,
        });
        toast.success("Media uploaded successfully");
      }

      resetForm();
      fetchMediaItems();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save media");
    } finally {
      setUploading(false);
    }
  };

  const handleEditMedia = (item: MediaItem) => {
    setEditingMedia(item);
    setMediaName(item.name);
    setMediaType(item.type as 'image' | 'video');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteMedia = async (id: number) => {
    try {
      await mediaAPI.delete(id);
      toast.success("Media deleted");
      if (editingMedia?.id === id) {
        resetForm();
      }
      fetchMediaItems();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete media");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button onClick={() => navigate("/admin")} variant="outline" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>

          <h1 className="text-4xl font-bold text-foreground mb-8">Manage Media</h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingMedia ? "Edit Media" : "Add New Media"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="mediaName">Media Name</Label>
                <Input
                  id="mediaName"
                    value={mediaName}
                    onChange={(e) => setMediaName(e.target.value)}
                    placeholder="E.g. Hero Banner Background"
                    required
                />
              </div>
              <div>
                  <Label htmlFor="mediaType">Media Type</Label>
                  <select
                    id="mediaType"
                    value={mediaType}
                    onChange={(e) => {
                      setMediaType(e.target.value as 'image' | 'video');
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="mediaFile">{editingMedia ? "Replace File (optional)" : "Upload File"}</Label>
                <Input
                  id="mediaFile"
                    ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {selectedFile.name}
                  </p>
                )}
                  {editingMedia && !selectedFile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Current file will be reused if you don't upload a new one.
                    </p>
                  )}
              </div>
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1" disabled={uploading}>
                <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Saving..." : editingMedia ? "Update Media" : "Add Media"}
                  </Button>
                  {editingMedia && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
              </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media Library ({mediaItems.length} items)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading media library...</p>
              ) : mediaItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No media items yet</p>
              ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {mediaItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 flex flex-col gap-2">
                    {item.type === 'image' ? (
                        <img src={item.url} alt={item.name} className="w-full h-40 object-cover rounded" />
                    ) : (
                        <video src={item.url} className="w-full h-40 object-cover rounded" controls />
                    )}
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                      {item.mimeType && (
                        <p className="text-xs text-muted-foreground">{item.mimeType}</p>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditMedia(item)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                    <Button
                      onClick={() => handleDeleteMedia(item.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                      </div>
                  </div>
                ))}
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

export default ManageMedia;
