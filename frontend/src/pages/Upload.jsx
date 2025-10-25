// src/pages/Upload.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";
import Navbar from "@/components/Navbar";

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 1 * 1024 * 1024) {
        toast.error("File size exceeds 1MB limit");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls') && !file.name.toLowerCase().endsWith('.csv')) {
      toast.error("File must be .xlsx, .xls, or .csv");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axiosInstance.post("/datasets/upload", formData);
      toast.success(res.data.message || "File uploaded successfully!");
      setFile(null);
      navigate("/dashboard");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <Navbar />
      <Card className="w-[400px] bg-background text-foreground border-border shadow-lg">
        <CardHeader>
          <CardTitle>Upload Dataset</CardTitle>
          <CardDescription>Upload an Excel or CSV file (max 1MB).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="pb-2" htmlFor="file">Excel or CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="bg-background text-foreground border-border"
            />
          </div>
        </CardContent>
        <div className="flex justify-center p-4">
          <Button
            onClick={handleUpload}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Upload;