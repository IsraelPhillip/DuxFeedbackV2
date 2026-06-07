import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { FeedbackForm } from "@/components/FeedbackForm";
import { Button } from "@/components/ui/button";

export function FeedbackPage() {
  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="border-b bg-background">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-1" /> Home
            </Link>
          </Button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <FeedbackForm />
        </motion.div>
      </main>
    </div>
  );
}
