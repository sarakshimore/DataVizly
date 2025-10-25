// src/pages/Landing.jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { NumberTicker } from "@/components/ui/number-ticker";
import { TypingAnimation } from "@/components/ui/typing-animation";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  ArrowRight,
  Shield,
  Upload,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Users,
  Database,
  TrendingUp,
  Sparkles,
  Mail,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const { token, user } = useSelector((state) => state.auth || {});

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Pulses */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div
          className="transform transition-all duration-700 ease-out"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
            opacity: 1 - scrollY / 500,
          }}
        >

          <AnimatedShinyText className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-foreground">
            Visualize Your Data
            <br />
            with DataVizly
          </AnimatedShinyText>

          <div className="text-xl md:text-2xl lg:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
            <TypingAnimation className="font-medium typing-animation">
              Transform complex datasets into stunning, interactive visualizations
            </TypingAnimation>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => {
                if (token || user) {
                  navigate("/upload");
                } else {
                  navigate("/login");
                }
              }}
              className="group px-8 py-6 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
            {["No credit card required", "Free forever plan", "Setup in 2 minutes"].map((msg, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> <span>{msg}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 md:px-8 bg-muted text-center">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-primary/10 text-primary font-medium text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Why Choose DataVizly?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to turn data into insights
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              {
                title: "Secure Authentication",
                description:
                  "Sign up and log in securely to manage your data with confidence.",
                icon: Shield,
              },
              {
                title: "Easy Data Uploads",
                description:
                  "Upload Excel files and transform them into actionable insights in seconds.",
                icon: Upload,
              },
              {
                title: "Powerful Visualizations",
                description:
                  "Create interactive charts and dashboards effortlessly.",
                icon: BarChart3,
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="group border border-border shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 bg-card text-foreground text-center"
              >
                <CardHeader>
                  <div className="inline-flex p-4 rounded-xl bg-primary/10 text-primary mb-4 shadow-sm">
                    <feature.icon className="w-8 h-8" />
                    <p className="text-2xl font-bold pl-5">{feature.title}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
<section className="py-24 bg-white text-center dark:bg-background transition-colors duration-300">
  <div className="max-w-7xl mx-auto px-4">
    <div className="mb-16">
      <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-primary/10 backdrop-blur-sm text-primary font-medium text-sm">
        <TrendingUp className="w-4 h-4" />
        <span>Our Impact</span>
      </div>
      <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
        Trusted by Data Enthusiasts
      </h2>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Join thousands of users already visualizing their data beautifully
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      {[
        { value: 1000, label: "Users Worldwide", suffix: "+", icon: Users },
        { value: 100, label: "Datasets Uploaded", suffix: "+", icon: Database },
        { value: 500, label: "Visualizations Created", suffix: "+", icon: BarChart3 },
      ].map((stat, i) => (
        <div
          key={i}
          className="text-center transform hover:scale-105 transition-transform duration-300"
        >
          <div className="inline-block mb-4 p-8 rounded-2xl border border-border bg-primary/5 backdrop-blur-sm">
            <stat.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
            {/* Numbers stay pure black across themes */}
            <p className="text-5xl md:text-6xl font-bold mb-2">
              <NumberTicker value={stat.value} />{stat.suffix}
            </p>
          </div>
          <p className="text-lg text-muted-foreground font-medium">{stat.label}</p>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* Footer */}
      <footer className="py-12 bg-muted text-muted-foreground text-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center">
            <div className="col-span-1 md:col-span-2 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <BarChart3 className="w-8 h-8 text-primary" />
                <h3 className="text-2xl font-bold text-foreground">DataVizly</h3>
              </div>
              <p className="text-muted-foreground max-w-md mx-auto">
                Transform data into stunning insights with our modern visualization platform.
              </p>
              <div className="flex justify-center gap-4 mt-6">
                {[Twitter, Linkedin, Github].map((Icon, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-200"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/login" className="hover:text-foreground">Login</a></li>
                <li><a href="/login" className="hover:text-foreground">Sign Up</a></li>
                <li><a href="#" className="hover:text-foreground">Features</a></li>
                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 DataVizly. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
