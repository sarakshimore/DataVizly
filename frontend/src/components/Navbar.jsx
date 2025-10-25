// src/components/Navbar.jsx
import { Menu, LogOut, User, Upload, LayoutDashboard, ChartAreaIcon, Users } from "lucide-react";
import React, { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser, logout as logoutAction } from "@/store/authSlice";
import { toast } from "sonner";
import { ModeToggle } from "./mode-toggle";
import axios from "axios";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, loading } = useSelector((state) => state.auth);

  // Fetch user data when token exists
  useEffect(() => {
    if (token && !user && !loading) {
      dispatch(fetchUser()).unwrap().catch(() => {
        localStorage.removeItem("token");
        dispatch(logoutAction());
      });
    }
  }, [token, user, loading, dispatch]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8000/auth/logout");
    } catch (err) {
      console.warn("Logout endpoint failed, continuing client-side logout");
    } finally {
      localStorage.removeItem("token");
      dispatch(logoutAction());
      toast.success("Logged out successfully");
      navigate("/");
    }
  };

  return (
    <div className="h-16 dark:bg-[#020817] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-10">
      {/* Desktop */}
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full">
        <div className="flex items-center gap-2">
          <ChartAreaIcon size={30} />
          <Link to="/">
            <h1 className="hidden md:block font-extrabold text-2xl">DataVizly</h1>
          </Link>
        </div>

        <div className="flex items-center gap-8">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src={user?.photoUrl || "https://github.com/shadcn.png"}
                    alt={user?.name}
                  />
                  <AvatarFallback>{user?.name?.[0] ?? "U"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <b>Welcome, {user?.name ?? user?.email}</b>
                  </DropdownMenuItem>

                  {/* ✅ ADMIN OPTIONS */}
                  {user?.role === "admin" ? (
                    <>
                      <DropdownMenuItem>
                        <Link to="/admin" className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Registered Users
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to="/profile" className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Edit Profile
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem>
                        <Link to="/upload" className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Upload Dataset
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to="/dashboard" className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to="/profile" className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Edit Profile
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/login")}>Signup</Button>
            </div>
          )}
          <ModeToggle />
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center justify-between px-4 h-full">
        <h1 className="font-extrabold text-2xl">DataVizly</h1>
        <MobileNavbar user={user} onLogout={handleLogout} />
      </div>
    </div>
  );
};

const MobileNavbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="rounded-full">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="flex flex-row items-center justify-between mt-2">
          <SheetTitle>
            <Link to="/">DataVizly</Link>
          </SheetTitle>
          <ModeToggle />
        </SheetHeader>
        <div className="my-2 border-t" />
        <nav className="flex flex-col space-y-4">
          {user ? (
            <>
              <div className="font-bold">
                Welcome, {user?.name ?? user?.email}
              </div>

              {/* ✅ ADMIN LINKS */}
              {user?.role === "admin" ? (
                <>
                  <Link to="/admin">Registered Users</Link>
                  <Link to="/profile">Edit Profile</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/upload">Upload Dataset</Link>
                  <Link to="/profile">Edit Profile</Link>
                </>
              )}

              <button onClick={onLogout} className="text-left">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/login">Signup</Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default Navbar;
