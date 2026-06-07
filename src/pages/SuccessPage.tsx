import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export function SuccessPage() {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Logo />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md text-center rounded-2xl border bg-card p-10 shadow-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
            className="mx-auto h-20 w-20 rounded-full bg-gold-gradient flex items-center justify-center shadow-gold mb-6"
          >
            <Check className="h-10 w-10 text-secondary" strokeWidth={3} />
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-bold">Thank You For Your Feedback</h1>
          <p className="text-muted-foreground mt-3">
            Your review has been successfully submitted and will help Duxbank improve its services
            and customer experience.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild variant="outline">
              <Link to="/">Return Home</Link>
            </Button>
            <Button asChild className="bg-gold text-secondary hover:bg-gold-dark">
              <Link to="/feedback">Submit Another Feedback</Link>
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
