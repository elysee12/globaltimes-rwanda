import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trash2, Edit2, Upload } from "lucide-react";
import { toast } from "sonner";
import { advertisementsAPI, Advertisement, uploadAPI, AD_PLACEMENTS, AdPlacement } from "@/lib/api";

const placementLabels: Record<AdPlacement, string> = {
  banner: "Banner",
  sidebar: "Sidebar",
  inline: "Inline",
  header: "Header",
  footer: "Footer",
  ticker: "Ticker",
  hero: "Hero",
  article: "In-Article",
};

const isVideoUrl = (url?: string) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
};

type AdFormState = {
  title: string;
  mediaUrl: string;
  linkUrl: string;
  placement: AdPlacement;
  isPublished: boolean;
};

type AdvertisementInput = Omit<Advertisement, "id" | "createdAt" | "updatedAt">;

const defaultFormState: AdFormState = {
  title: "",
  mediaUrl: "",
  linkUrl: "",
  placement: "banner",
  isPublished: true,
};

const ManageAds = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<AdFormState>(defaultFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const data = await advertisementsAPI.getAll();
      setAds(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load advertisements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const resetForm = () => {
    setFormState(defaultFormState);
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Please select an image or video file");
      return;
    }

    const sizeLimitMb = file.type.startsWith("video/") ? 50 : 10;
    if (file.size > sizeLimitMb * 1024 * 1024) {
      toast.error(`File must be smaller than ${sizeLimitMb}MB`);
      return;
    }

    try {
      setUploadingMedia(true);
      const uploaded = await uploadAPI.uploadFile(file);
      setFormState((prev) => ({ ...prev, mediaUrl: uploaded.url }));
      toast.success("Media uploaded");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload media");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim()) {
      toast.error("Please provide an internal title for accessibility");
      return;
    }

    try {
      setSubmitting(true);
      const payload: AdvertisementInput = {
        title: formState.title.trim(),
        placement: formState.placement,
        mediaUrl: formState.mediaUrl.trim() ? formState.mediaUrl.trim() : undefined,
        linkUrl: formState.linkUrl.trim() ? formState.linkUrl.trim() : undefined,
        isPublished: formState.isPublished,
      };

      if (editingId !== null) {
        await advertisementsAPI.update(editingId, payload);
        toast.success("Advertisement updated");
      } else {
        await advertisementsAPI.create(payload);
        toast.success("Advertisement created");
      }

      resetForm();
      await fetchAds();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save advertisement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setFormState({
      title: ad.title,
      mediaUrl: ad.mediaUrl || "",
      linkUrl: ad.linkUrl || "",
      placement: ad.placement,
      isPublished: ad.isPublished,
    });
    setEditingId(ad.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteAd = async (id: number) => {
    try {
      await advertisementsAPI.delete(id);
      toast.success("Advertisement deleted");
      if (editingId === id) {
        resetForm();
      }
      await fetchAds();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete advertisement");
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

          <h1 className="text-4xl font-bold text-foreground mb-8">Manage Advertisements</h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Advertisement" : "Add New Advertisement"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="adPlacement">Placement</Label>
                  <select
                    id="adPlacement"
                    value={formState.placement}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, placement: e.target.value as AdPlacement }))
                    }
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    {AD_PLACEMENTS.map((placement) => (
                      <option key={placement} value={placement}>
                        {placementLabels[placement]}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose where this advertisement should appear across the site.
                  </p>
                </div>

                <div>
                  <Label htmlFor="adTitle">Internal Title *</Label>
                  <Input
                    id="adTitle"
                    value={formState.title}
                    onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Only used for alt text and admin reference"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Users will not see this text. It is strictly for accessibility and management.
                  </p>
                </div>

                <div>
                  <Label htmlFor="adMedia">Media URL (image or video)</Label>
                    <Input
                    id="adMedia"
                    value={formState.mediaUrl}
                    onChange={(e) => setFormState((prev) => ({ ...prev, mediaUrl: e.target.value }))}
                      placeholder="https://example.com/banner.jpg"
                    />
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleMediaUpload}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingMedia}
                        className="sm:w-auto w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                      {uploadingMedia ? "Uploading..." : "Upload media"}
                      </Button>
                    {formState.mediaUrl && (
                      <span className="text-xs text-muted-foreground break-all">{formState.mediaUrl}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                    Upload an image (10MB max) or video (50MB max). Leave blank for ticker/text-only placements.
                    </p>
                  </div>

                <div>
                  <Label htmlFor="adLink">Link URL</Label>
                  <Input
                    id="adLink"
                    value={formState.linkUrl}
                    onChange={(e) => setFormState((prev) => ({ ...prev, linkUrl: e.target.value }))}
                    placeholder="https://advertiser.com"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="published"
                    checked={formState.isPublished}
                    onCheckedChange={(checked) =>
                      setFormState((prev) => ({ ...prev, isPublished: Boolean(checked) }))
                    }
                  />
                  <Label htmlFor="published">Published advertisement</Label>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1" disabled={submitting}>
                <Plus className="h-4 w-4 mr-2" />
                    {submitting ? "Saving..." : editingId ? "Update Advertisement" : "Add Advertisement"}
                  </Button>
                  {editingId && (
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
              <CardTitle>Advertisements ({ads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading advertisements...</p>
              ) : ads.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No advertisements yet</p>
              ) : (
              <div className="space-y-4">
                {ads.map((ad) => (
                    <div key={ad.id} className="border rounded-lg p-4 flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-32 h-32 rounded overflow-hidden bg-muted flex items-center justify-center">
                        {ad.mediaUrl ? (
                          isVideoUrl(ad.mediaUrl) ? (
                            <video src={ad.mediaUrl} className="w-full h-full object-cover" controls />
                          ) : (
                            <img src={ad.mediaUrl} alt={ad.title} className="w-full h-full object-cover" />
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground text-center px-2">Text-only placement</span>
                        )}
                        <span className="sr-only">{ad.title}</span>
                      </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xs uppercase text-muted-foreground tracking-wide">Placement</p>
                            <p className="font-semibold capitalize">
                              {placementLabels[ad.placement] || ad.placement}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              ad.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {ad.isPublished ? "Published" : "Unpublished"}
                          </span>
                        </div>
                        {ad.linkUrl && (
                          <a
                            href={ad.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary underline break-all"
                          >
                            {ad.linkUrl}
                          </a>
                        )}
                    </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(ad)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleDeleteAd(ad.id)} variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
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

export default ManageAds;
