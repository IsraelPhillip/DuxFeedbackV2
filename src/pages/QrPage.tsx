import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { QrCard } from "@/components/QrCard";
import { Button } from "@/components/ui/button";

export function QrPage() {
  const feedbackUrl = `${window.location.origin}/`;

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
      <main className="max-w-2xl mx-auto px-4 py-10 md:py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Feedback QR Code</h1>
          <p className="text-muted-foreground mt-2">
            Download, print, or share this QR code to direct customers to the Duxbank feedback
            form.
          </p>
        </div>
        <div className="flex justify-center">
          <QrCard url={feedbackUrl} />
        </div>
      </main>
    </div>
  );
}
