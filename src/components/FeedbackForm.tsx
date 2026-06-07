import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { feedbackSchema, type FeedbackInput, SERVICES } from "@/lib/feedback-schema";
import { supabase } from "@/integrations/supabase/client";

export function FeedbackForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      account_number: "",
      rating: 0,
      services_used: [],
      feedback_comment: "",
      consent_given: false,
    },
  });

  const rating = watch("rating");
  const services = watch("services_used");
  const comment = watch("feedback_comment") || "";
  const consent = watch("consent_given");

  const toggleService = (s: string) => {
    setValue(
      "services_used",
      services.includes(s) ? services.filter((x) => x !== s) : [...services, s],
      { shouldValidate: true }
    );
  };

  const onSubmit = async (data: FeedbackInput) => {
    const { error } = await supabase.from("feedback_submissions").insert({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      account_number: data.account_number || null,
      rating: data.rating,
      services_used: data.services_used,
      feedback_comment: data.feedback_comment,
      consent_given: data.consent_given,
      device_info_optional:
        typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : null,
    });
    if (error) {
      toast.error("Could not submit. Please try again.");
      return;
    }
    navigate({ to: "/success" });
  };

  return (
    <div className="rounded-2xl bg-card border shadow-sm overflow-hidden">
      <div className="bg-gold-gradient px-6 py-6">
        <h2 className="text-2xl md:text-3xl font-bold text-secondary">
          Share Your Experience
        </h2>
        <p className="text-secondary/80 mt-1">
          Your feedback helps us improve Duxbank's services.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
        <section className="space-y-4">
          <h3 className="font-semibold text-lg">Customer Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First name *</Label>
              <Input id="first_name" {...register("first_name")} aria-invalid={!!errors.first_name} />
              {errors.first_name && (
                <p className="text-xs text-destructive mt-1">{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="last_name">Last name *</Label>
              <Input id="last_name" {...register("last_name")} aria-invalid={!!errors.last_name} />
              {errors.last_name && (
                <p className="text-xs text-destructive mt-1">{errors.last_name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="account_number">Account number (optional)</Label>
              <Input id="account_number" {...register("account_number")} />
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-lg">Satisfaction Rating *</h3>
          <StarRating value={rating} onChange={(v) => setValue("rating", v, { shouldValidate: true })} />
          {errors.rating && (
            <p className="text-xs text-destructive">{errors.rating.message}</p>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold text-lg">Services Recently Used</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {SERVICES.map((s) => {
              const active = services.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleService(s)}
                  aria-pressed={active}
                  className={`text-left rounded-xl border p-3 text-sm transition-all ${
                    active
                      ? "border-gold bg-gold/10 shadow-gold"
                      : "hover:border-gold/50 hover:bg-accent/50"
                  }`}
                >
                  <span className="font-medium">{s}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-lg">Your Feedback *</h3>
          <Textarea
            rows={5}
            placeholder="Please share your experience with Duxbank. Your feedback helps us improve our services."
            maxLength={1000}
            {...register("feedback_comment")}
            aria-invalid={!!errors.feedback_comment}
          />
          <div className="flex justify-between text-xs">
            <span className="text-destructive">{errors.feedback_comment?.message}</span>
            <span className="text-muted-foreground">{comment.length}/1000</span>
          </div>
        </section>

        <section className="flex items-start gap-3 rounded-xl border p-4 bg-muted/30">
          <Checkbox
            id="consent"
            checked={consent}
            onCheckedChange={(v) => setValue("consent_given", v === true)}
            className="mt-0.5"
          />
          <Label htmlFor="consent" className="text-sm leading-relaxed font-normal cursor-pointer">
            I agree that Duxbank may use my feedback for service improvement and customer
            experience enhancement purposes.
          </Label>
        </section>

        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="w-full bg-gold text-secondary hover:bg-gold-dark shadow-gold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" /> Submit Feedback
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
