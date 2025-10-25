// src/pages/Profile.jsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser, setCredentials } from "@/store/authSlice";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";
import Navbar from "@/components/Navbar";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const isFetching = useRef(false);
  
  const [view, setView] = useState("profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user only once on mount if needed
  useEffect(() => {
    if (token && !user && !isFetching.current) {
      isFetching.current = true;
      dispatch(fetchUser());
    }
  }, []); // Empty array - runs only once on mount

  // Populate form when user data is available
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.put("/auth/me", { name, email });
      dispatch(setCredentials({ user: { ...user, name, email }, token }));
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post("/auth/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully!");
      setView("profile");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        {view === "profile" ? (
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Your Profile
              </CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                View and update your account details
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="pb-2" htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div>
                <Label className="pb-2" htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={handleUpdateProfile} disabled={loading}>
                  {loading ? "Saving..." : "Update Profile"}
                </Button>
                <Button variant="outline" onClick={() => setView("password")}>
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Change Password
              </CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                Update your account password securely
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="pb-2" htmlFor="oldPassword">Current Password</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div>
                <Label className="pb-2" htmlFor="newPassword">
                  New Password (Should be minimum 8 characters)
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div>
                <Label className="pb-2" htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={handleChangePassword} disabled={loading}>
                  {loading ? "Updating..." : "Change Password"}
                </Button>
                <Button variant="outline" onClick={() => setView("profile")}>
                  Back to Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default Profile;
