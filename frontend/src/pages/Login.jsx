import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/authSlice";
import Navbar from "@/components/Navbar";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [signupLoading, setSignupLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  const handleSignup = async () => {
    setSignupLoading(true);
    try {
      if (!signupInput.name.trim()) {
        toast.error("Name is required");
        setSignupLoading(false);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupInput.email)) {
        toast.error("Invalid email address");
        setSignupLoading(false);
        return;
      }
      if (signupInput.password.length < 8 || signupInput.password.length > 72) {
        toast.error("Password must be between 8 and 72 characters");
        setSignupLoading(false);
        return;
      }

      const res = await axiosInstance.post("/auth/register", signupInput);
      // Optionally, fetch user profile here or after signup
      dispatch(
        setCredentials({
          user: { email: signupInput.email, name: signupInput.name },
          token: res.data.access_token,
        })
      );
      toast.success("Signup successful!");
      setSignupInput({ name: "", email: "", password: "" });
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Signup failed");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleLogin = async () => {
  setLoginLoading(true);
  try {
    // simple client-side validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginInput.email)) {
      toast.error("Invalid email address");
      return;
    }
    if (loginInput.password.length < 8 || loginInput.password.length > 72) {
      toast.error("Password must be between 8 and 72 characters");
      return;
    }

    const loginRes = await axiosInstance.post("/auth/login", loginInput);

    const token = loginRes?.data?.access_token;
    if (!token) {
      // helpful debug info if backend responded but didn't include token
      console.error("Login response missing access_token:", loginRes?.data);
      throw new Error("No access token returned from server");
    }

    // make subsequent requests authenticated
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // fetch full user info
    let userRes;
    try {
      userRes = await axiosInstance.get("/auth/me");
    } catch (meErr) {
      // still allow login (token exists) — but log the /me error
      console.error("Failed to fetch /auth/me after login:", meErr);
      // Option A: throw to show an error and stop - I'll choose to surface a friendly error
      throw meErr;
    }

    dispatch(setCredentials({ user: userRes.data, token }));

    toast.success("Login successful!");
    setLoginInput({ email: "", password: "" });
    navigate("/");
  } catch (err) {
    console.error("Login error:", err);
    // show server message when available
    toast.error(err.response?.data?.detail || err.message || "Login failed");
  } finally {
    setLoginLoading(false);
  }
};

  return (
    <div className="flex items-center w-full justify-center mt-20 min-h-screen">
      <Navbar />
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Signup</TabsTrigger>
        </TabsList>

        {/* Signup Form */}
        <TabsContent value="signup">
          <Card className="bg-background text-foreground border-border shadow-lg">
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription>Create a new account and click signup when you're done.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={signupInput.name}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Eg. Patel"
                  required
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={signupInput.email}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Eg. patel@gmail.com"
                  required
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={signupInput.password}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Eg. xyz"
                  required
                  className="bg-background text-foreground border-border"
                />
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full flex justify-center">
                <Button disabled={signupLoading} onClick={handleSignup} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {signupLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                    </>
                  ) : (
                    "Signup"
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Login Form */}
        <TabsContent value="login">
          <Card className="bg-background text-foreground border-border shadow-lg">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Login with your email and password. After signup, you'll be logged in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={loginInput.email}
                  onChange={(e) => changeInputHandler(e, "login")}
                  placeholder="Eg. patel@gmail.com"
                  required
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={loginInput.password}
                  onChange={(e) => changeInputHandler(e, "login")}
                  placeholder="Eg. xyz"
                  required
                  className="bg-background text-foreground border-border"
                />
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full flex justify-center">
                <Button disabled={loginLoading} onClick={handleLogin} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {loginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Login;
