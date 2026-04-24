import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, Pencil, Plus } from "lucide-react";

interface P { id: string; name: string; slug: string; description: string; price: number; image_url: string | null; stock: number; category_id: string | null; featured: boolean; }
interface C { id: string; name: string; }

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

const empty = { name: "", slug: "", description: "", price: 0, image_url: "", stock: 0, category_id: "", featured: false };

function AdminProducts() {
  const [products, setProducts] = useState<P[]>([]);
  const [categories, setCategories] = useState<C[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<P | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts((data as any) ?? []);
  };
  useEffect(() => {
    load();
    supabase.from("categories").select("id,name").then(({ data }) => setCategories((data as any) ?? []));
  }, []);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: P) => { setEditing(p); setForm({ ...p, image_url: p.image_url ?? "", category_id: p.category_id ?? "" } as any); setOpen(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description: form.description,
      price: Number(form.price),
      image_url: form.image_url || null,
      stock: Number(form.stock),
      category_id: form.category_id || null,
      featured: form.featured,
    };
    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(editing ? "Updated" : "Created"); setOpen(false); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Products</h1>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />New product</Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-left">
            <tr>
              <th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.image_url && <img src={p.image_url} alt="" className="h-10 w-10 rounded object-cover" />}
                    <div><div className="font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.slug}</div></div>
                  </div>
                </td>
                <td className="p-3">${Number(p.price).toFixed(2)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
            <div><Label>Slug (optional)</Label><Input value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Price</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({...form, price: Number(e.target.value)})} /></div>
              <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({...form, stock: Number(e.target.value)})} /></div>
            </div>
            <div><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({...form, image_url: e.target.value})} /></div>
            <div>
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({...form, category_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({...form, featured: e.target.checked})} />
              Featured on homepage
            </label>
            <Button type="submit" className="w-full">{editing ? "Save changes" : "Create product"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
