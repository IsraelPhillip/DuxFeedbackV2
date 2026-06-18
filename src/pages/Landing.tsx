import { motion } from "framer-motion";
import { Shield, Zap, BarChart3, Sparkles, LogIn, QrCode } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { FeedbackForm } from "@/components/FeedbackForm";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: Shield, title: "Secure Feedback", desc: "Bank-grade privacy on every submission." },
  { icon: Zap, title: "Quick Submission", desc: "Share your experience in under a minute." },
  { icon: Sparkles, title: "Satisfaction Tracking", desc: "Your voice shapes our service quality." },
  { icon: BarChart3, title: "Service Analytics", desc: "Insights that drive real improvements." },
];

export function Landing() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b sticky top-0 z-30 bg-background/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Logo />
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gold-gradient opacity-10 pointer-events-none" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium mb-5">
                <Sparkles className="h-3 w-3 text-gold" /> Customer Experience
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                Duxbank Customer <span className="text-gold">Feedback</span> Form
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
                Help us improve our banking services by sharing your experience. Your feedback
                shapes the future of Duxbank Microfinance.
              </p>
             
              </div>
            </motion.div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 -mt-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FeedbackForm />
          </motion.div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Why your feedback matters
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border bg-card p-6 hover:shadow-gold transition-shadow"
              >
                <div className="h-10 w-10 rounded-lg bg-gold/15 flex items-center justify-center mb-3">
                  <f.icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t mt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <Logo />
           <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Button asChild size="lg" variant="outline">
                  <Link to="/qr">
                    <QrCode className="h-4 w-4 mr-1" /> Download QR Code
                  </Link>
                </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">
              <LogIn className="h-4 w-4 mr-1" /> Admin Login
            </Link>
          </Button>
          <p>© {new Date().getFullYear()} Duxbank Microfinance Bank. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
