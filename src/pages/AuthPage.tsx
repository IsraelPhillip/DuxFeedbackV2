import { useEffect, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created. You can now sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin", replace: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh bg-secondary text-secondary-foreground flex flex-col">
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo className="text-white [&_*]:!text-white" />
          <Button asChild variant="ghost" size="sm" className="text-white hover:text-secondary">
            <Link to="/">Home</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-card text-card-foreground p-8 shadow-2xl">
          <div className="flex items-center gap-2 text-gold mb-2">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest">Admin Access</span>
          </div>
          <h1 className="text-2xl font-bold">
            {mode === "signin" ? "Sign in to Dashboard" : "Create Admin Account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin"
              ? "Authorized Duxbank staff only."
              : "The first signup automatically becomes admin."}
          </p>

          <form onSubmit={submit} className="space-y-4 mt-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-gold text-secondary hover:bg-gold-dark shadow-gold"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "signin" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <button
            className="text-sm text-muted-foreground hover:text-foreground mt-4 underline-offset-4 hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin"
              ? "First time? Create the initial admin account"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </main>
    </div>
  );
}
