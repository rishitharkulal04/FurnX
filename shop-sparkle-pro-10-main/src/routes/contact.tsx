import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — furnX" },
      { name: "description", content: "Get in touch with furnX." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [busy, setBusy] = useState(false);
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-bold">Contact us</h1>
      <p className="mt-3 text-muted-foreground">We'd love to hear from you.</p>
      <form onSubmit={(e) => { e.preventDefault(); setBusy(true); setTimeout(() => { setBusy(false); toast.success("Thanks — we'll get back to you soon."); }, 600); }} className="mt-8 space-y-4">
        <div><Label>Name</Label><Input required maxLength={100} /></div>
        <div><Label>Email</Label><Input type="email" required maxLength={255} /></div>
        <div><Label>Message</Label><Textarea required maxLength={1000} rows={5} /></div>
        <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send message"}</Button>
      </form>
    </div>
  );
}
