import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Apple,
  ArrowUpDown,
  BarChart3,
  Carrot,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  IndianRupee,
  Leaf,
  MapPin,
  PackageOpen,
  Plus,
  Search,
  ShoppingBasket,
  Sprout,
  TrendingUp,
  UserRound,
  Wheat,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KrishiSetu — Farmer to Market" },
      { name: "description", content: "List harvests, discover fresh produce, and compare mandi prices with KrishiSetu." },
      { property: "og:title", content: "KrishiSetu — Farmer to Market" },
      { property: "og:description", content: "List harvests, discover fresh produce, and compare mandi prices with KrishiSetu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KrishiSetu,
});

type View = "farmer" | "marketplace" | "analytics";
type Produce = {
  id: string;
  crop_name: string;
  category: "Vegetables" | "Fruits" | "Grains" | "Pulses";
  quantity_kg: number;
  price_per_kg: number;
  farmer_name: string;
  location: string;
  status?: string;
};
type Analytics = { category: string; average_price: number; farmer_earning: number; mandi_margin: number }[];

const API_URL = "http://localhost:8000";
const mockProduce: Produce[] = [
  { id: "onion-1", crop_name: "Nashik Red Onion", category: "Vegetables", quantity_kg: 680, price_per_kg: 28, farmer_name: "Ramesh Jadhav", location: "Nashik, Maharashtra" },
  { id: "tomato-1", crop_name: "Pune Tomatoes", category: "Vegetables", quantity_kg: 320, price_per_kg: 34, farmer_name: "Sonal Patil", location: "Pune, Maharashtra" },
  { id: "mango-1", crop_name: "Ratnagiri Alphonso", category: "Fruits", quantity_kg: 145, price_per_kg: 290, farmer_name: "Vilas Sawant", location: "Ratnagiri, Maharashtra" },
  { id: "wheat-1", crop_name: "Lokwan Wheat", category: "Grains", quantity_kg: 920, price_per_kg: 41, farmer_name: "Arjun More", location: "Satara, Maharashtra" },
  { id: "chickpea-1", crop_name: "Desi Chickpeas", category: "Pulses", quantity_kg: 460, price_per_kg: 88, farmer_name: "Meena Shinde", location: "Ahmednagar, Maharashtra" },
  { id: "grapes-1", crop_name: "Thompson Grapes", category: "Fruits", quantity_kg: 270, price_per_kg: 105, farmer_name: "Prakash Borse", location: "Sangli, Maharashtra" },
];
const mockAnalytics: Analytics = [
  { category: "Vegetables", average_price: 31, farmer_earning: 27.9, mandi_margin: 8.2 },
  { category: "Fruits", average_price: 198, farmer_earning: 178.2, mandi_margin: 51.5 },
  { category: "Grains", average_price: 41, farmer_earning: 36.9, mandi_margin: 11.1 },
  { category: "Pulses", average_price: 88, farmer_earning: 79.2, mandi_margin: 24.4 },
];
const categoryIcons = { Vegetables: Carrot, Fruits: Apple, Grains: Wheat, Pulses: Leaf };
const categoryStyles = { Vegetables: "bg-mint text-forest", Fruits: "bg-amber-soft text-amber", Grains: "bg-sky-soft text-forest", Pulses: "bg-lilac-soft text-forest" };

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

async function getJson<T>(path: string, fallback: T): Promise<{ data: T; live: boolean }> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(`${API_URL}${path}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return { data: (await response.json()) as T, live: true };
  } catch {
    return { data: fallback, live: false };
  } finally {
    window.clearTimeout(timeout);
  }
}

function KrishiSetu() {
  const [view, setView] = useState<View>("farmer");
  const [produce, setProduce] = useState<Produce[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>(mockAnalytics);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(true);
  const [selected, setSelected] = useState<Produce | null>(null);

  const refresh = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const [produceResult, analyticsResult] = await Promise.all([
      getJson<Produce[]>("/api/produce", mockProduce),
      getJson<Analytics[]>("/api/analytics/summary", mockAnalytics),
    ]);
    setProduce(Array.isArray(produceResult.data) ? produceResult.data : mockProduce);
    setAnalytics(Array.isArray(analyticsResult.data) ? analyticsResult.data : mockAnalytics);
    setLive(produceResult.live && analyticsResult.live);
    setLoading(false);
  };

  useEffect(() => { void refresh(); }, []);

  const metrics = useMemo(() => {
    const stock = produce.reduce((sum, item) => sum + Number(item.quantity_kg || 0), 0);
    const revenue = produce.reduce((sum, item) => sum + Number(item.quantity_kg || 0) * Number(item.price_per_kg || 0), 0);
    const average = produce.length ? produce.reduce((sum, item) => sum + Number(item.price_per_kg || 0), 0) / produce.length : 0;
    return { stock, revenue, average };
  }, [produce]);

  return (
    <div className="min-h-screen bg-background">
      <Header view={view} setView={setView} live={live} />
      <main className="mx-auto max-w-[1440px] px-4 pb-12 pt-7 sm:px-6 lg:px-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-forest">
              <Sprout className="size-4" /> Maharashtra network
            </p>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-forest-deep sm:text-4xl">
              {view === "farmer" ? "Good morning, farmer" : view === "marketplace" ? "Fresh from the farm" : "Market intelligence"}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {view === "farmer" ? "Keep your harvest moving with a clear view of what’s listed and what it can earn." : view === "marketplace" ? "Discover quality produce directly from farmers across Maharashtra." : "Understand category prices and see what direct trade keeps in farmer hands."}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm">
            <Clock3 className="size-4 text-forest" /> Updated just now
          </div>
        </div>

        {view === "farmer" && <FarmerView produce={produce} metrics={metrics} loading={loading} onRefresh={() => refresh(false)} />}
        {view === "marketplace" && <MarketplaceView produce={produce} loading={loading} onBuy={setSelected} />}
        {view === "analytics" && <AnalyticsView data={analytics} loading={loading} />}
      </main>
      {selected && <BuyModal produce={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function Header({ view, setView, live }: { view: View; setView: (view: View) => void; live: boolean }) {
  const views: { id: View; label: string; icon: typeof Sprout }[] = [
    { id: "farmer", label: "Farmer dashboard", icon: Sprout },
    { id: "marketplace", label: "Buyer marketplace", icon: ShoppingBasket },
    { id: "analytics", label: "Mandi analytics", icon: BarChart3 },
  ];
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex min-w-fit items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-forest text-primary-foreground shadow-sm"><Sprout className="size-5" /></div>
          <div><p className="font-display text-lg font-extrabold leading-none text-forest-deep">KrishiSetu</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">farm to fair</p></div>
        </div>
        <div className="order-3 flex w-full gap-1 overflow-x-auto rounded-xl border border-border bg-surface-muted p-1 sm:order-2 sm:mx-auto sm:w-auto">
          {views.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setView(id)} className={`flex min-w-max items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-all sm:px-4 ${view === id ? "bg-surface text-forest shadow-sm" : "text-muted-foreground hover:bg-surface/70 hover:text-forest"}`}><Icon className="size-4" />{label}</button>)}
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs font-semibold text-muted-foreground sm:order-3">
          {live ? <Wifi className="size-3.5 text-forest" /> : <WifiOff className="size-3.5 text-amber" />}
          <span className="hidden sm:inline">{live ? "Live server" : "Demo data"}</span><span className="size-1.5 rounded-full bg-forest" />
        </div>
      </div>
    </header>
  );
}

function MetricCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof Sprout; tone: string }) {
  return <div className="animate-float-in rounded-2xl border border-border bg-surface p-5 shadow-krishi"><div className={`mb-5 grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></div><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-forest-deep">{value}</p></div>;
}

function FarmerView({ produce, metrics, loading, onRefresh }: { produce: Produce[]; metrics: { stock: number; revenue: number; average: number }; loading: boolean; onRefresh: () => void }) {
  return <div className="space-y-7">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Active listings" value={loading ? "—" : String(produce.length)} icon={PackageOpen} tone="bg-mint text-forest" />
      <MetricCard label="Total stock listed" value={loading ? "—" : `${formatINR(metrics.stock)} kg`} icon={Wheat} tone="bg-sky-soft text-forest" />
      <MetricCard label="Estimated revenue" value={loading ? "—" : `₹${formatINR(metrics.revenue)}`} icon={IndianRupee} tone="bg-amber-soft text-amber" />
      <MetricCard label="Average selling price" value={loading ? "—" : `₹${formatINR(metrics.average)} / kg`} icon={TrendingUp} tone="bg-lilac-soft text-forest" />
    </div>
    <div className="grid gap-7 xl:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.7fr)]">
      <HarvestForm onCreated={onRefresh} />
      <ListingsTable produce={produce} loading={loading} />
    </div>
  </div>;
}

function HarvestForm({ onCreated }: { onCreated: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ crop_name: "", category: "Vegetables", quantity_kg: "", price_per_kg: "", farmer_name: "", location: "" });
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/produce`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, quantity_kg: Number(form.quantity_kg), price_per_kg: Number(form.price_per_kg) }) });
      if (!response.ok) throw new Error("Unable to save listing");
      toast.success("Harvest listed successfully"); setForm({ crop_name: "", category: "Vegetables", quantity_kg: "", price_per_kg: "", farmer_name: "", location: "" }); onCreated();
    } catch { toast.error("Couldn’t reach the server. Please try again when it’s online."); }
    finally { setSubmitting(false); }
  };
  return <section className="rounded-2xl border border-border bg-surface p-5 shadow-krishi sm:p-6"><div className="mb-5 flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-forest">Farmer tools</p><h2 className="mt-1 font-display text-xl font-extrabold text-forest-deep">List new harvest</h2></div><div className="grid size-9 place-items-center rounded-xl bg-mint text-forest"><Plus className="size-5" /></div></div><form onSubmit={submit} className="space-y-4">{[["crop_name", "Crop name", "e.g. Nashik Red Onion", "text"], ["farmer_name", "Farmer name", "Your full name", "text"], ["location", "Location", "Village or district", "text"]].map(([key, label, placeholder, type]) => <label key={key} className="block"><span className="mb-1.5 block text-xs font-bold text-forest-deep">{label}</span><input required value={form[key as keyof typeof form]} onChange={(event) => update(key, event.target.value)} placeholder={placeholder} type={type} className="h-10 w-full rounded-lg border border-input bg-surface-muted px-3 text-sm outline-none transition focus:border-forest focus:ring-2 focus:ring-mint" /></label>)}<div className="grid grid-cols-2 gap-3"><label className="block"><span className="mb-1.5 block text-xs font-bold text-forest-deep">Category</span><select value={form.category} onChange={(event) => update("category", event.target.value)} className="h-10 w-full rounded-lg border border-input bg-surface-muted px-2 text-sm outline-none focus:border-forest"><option>Vegetables</option><option>Fruits</option><option>Grains</option><option>Pulses</option></select></label><label className="block"><span className="mb-1.5 block text-xs font-bold text-forest-deep">Quantity (kg)</span><input required min="1" value={form.quantity_kg} onChange={(event) => update("quantity_kg", event.target.value)} placeholder="500" type="number" className="h-10 w-full rounded-lg border border-input bg-surface-muted px-3 text-sm outline-none focus:border-forest" /></label></div><label className="block"><span className="mb-1.5 block text-xs font-bold text-forest-deep">Price per kg (₹)</span><div className="relative"><IndianRupee className="absolute left-3 top-3 size-4 text-muted-foreground" /><input required min="1" value={form.price_per_kg} onChange={(event) => update("price_per_kg", event.target.value)} placeholder="28" type="number" className="h-10 w-full rounded-lg border border-input bg-surface-muted pl-9 pr-3 text-sm outline-none focus:border-forest" /></div></label><Button type="submit" disabled={submitting} className="mt-2 h-11 w-full rounded-xl bg-forest font-bold text-primary-foreground shadow-sm hover:bg-forest-deep">{submitting ? "Publishing…" : <><Plus className="size-4" /> Publish listing</>}</Button></form></section>;
}

function ListingsTable({ produce, loading }: { produce: Produce[]; loading: boolean }) {
  return <section className="min-w-0 rounded-2xl border border-border bg-surface p-5 shadow-krishi sm:p-6"><div className="mb-5 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-forest">Your produce</p><h2 className="mt-1 font-display text-xl font-extrabold text-forest-deep">Active listings</h2></div><span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-forest">{produce.length} available</span></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead><tr className="border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground"><th className="pb-3">Crop</th><th className="pb-3">Category</th><th className="pb-3">Stock</th><th className="pb-3">Price/kg</th><th className="pb-3">Location</th><th className="pb-3">Status</th></tr></thead><tbody>{loading ? Array.from({ length: 4 }).map((_, index) => <tr key={index} className="border-b border-border/70"><td colSpan={6} className="py-4"><Skeleton className="h-5 w-full" /></td></tr>) : produce.map((item) => <tr key={item.id} className="border-b border-border/70 last:border-0"><td className="py-4"><p className="text-sm font-bold text-forest-deep">{item.crop_name}</p><p className="mt-0.5 text-xs text-muted-foreground">{item.farmer_name}</p></td><td className="py-4"><CategoryBadge category={item.category} /></td><td className="py-4 text-sm font-semibold text-foreground">{formatINR(item.quantity_kg)} kg</td><td className="py-4 text-sm font-extrabold text-amber">₹{formatINR(item.price_per_kg)}</td><td className="py-4 text-xs text-muted-foreground">{item.location}</td><td className="py-4"><span className="inline-flex items-center gap-1.5 text-xs font-bold text-forest"><span className="size-1.5 rounded-full bg-forest" /> Available</span></td></tr>)}</tbody></table></div></section>;
}

function CategoryBadge({ category }: { category: Produce["category"] }) { const Icon = categoryIcons[category]; return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${categoryStyles[category]}`}><Icon className="size-3" />{category}</span>; }

function MarketplaceView({ produce, loading, onBuy }: { produce: Produce[]; loading: boolean; onBuy: (produce: Produce) => void }) {
  const [search, setSearch] = useState(""); const [category, setCategory] = useState("All"); const [sort, setSort] = useState("featured");
  const filtered = useMemo(() => produce.filter((item) => `${item.crop_name} ${item.farmer_name}`.toLowerCase().includes(search.toLowerCase()) && (category === "All" || item.category === category)).sort((a, b) => sort === "price" ? a.price_per_kg - b.price_per_kg : sort === "quantity" ? b.quantity_kg - a.quantity_kg : 0), [produce, search, category, sort]);
  return <div className="space-y-5"><div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 shadow-krishi sm:flex-row"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><input aria-label="Search produce or farmer" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search crop or farmer name" className="h-9 w-full rounded-lg bg-surface-muted pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:ring-2 focus:ring-mint" /></div><div className="flex gap-1 overflow-x-auto">{["All", "Vegetables", "Fruits", "Grains", "Pulses"].map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${category === item ? "bg-forest text-primary-foreground" : "text-muted-foreground hover:bg-mint hover:text-forest"}`}>{item}</button>)}</div><label className="relative flex min-w-[145px] items-center"><ArrowUpDown className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground" /><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-9 w-full appearance-none rounded-lg border border-input bg-surface pl-8 pr-7 text-xs font-bold text-forest-deep outline-none"><option value="featured">Sort: Featured</option><option value="price">Price: Low to high</option><option value="quantity">Quantity</option></select><ChevronDown className="pointer-events-none absolute right-2.5 size-3.5 text-muted-foreground" /></label></div><div className="flex items-center justify-between"><p className="text-sm font-semibold text-muted-foreground">{filtered.length} harvests ready to move</p><p className="flex items-center gap-1 text-xs font-semibold text-forest"><Check className="size-3.5" /> Direct from farmers</p></div>{loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[270px] rounded-2xl" />)}</div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((item, i) => <ProduceCard key={item.id} produce={item} onBuy={onBuy} delay={i % 3} />)}</div>}{!loading && filtered.length === 0 && <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center"><CircleHelp className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 font-bold text-forest-deep">No harvests match that search</p></div>}</div>;
}

function ProduceCard({ produce, onBuy, delay }: { produce: Produce; onBuy: (produce: Produce) => void; delay: number }) { const Icon = categoryIcons[produce.category]; const stock = Math.min(100, Math.max(18, produce.quantity_kg / 10)); return <article className={`animate-float-in delay-${delay * 100} group rounded-2xl border border-border bg-surface p-5 shadow-krishi transition hover:-translate-y-1 hover:shadow-lg`}><div className="flex items-start justify-between"><div className={`grid size-12 place-items-center rounded-2xl ${categoryStyles[produce.category]}`}><Icon className="size-6" /></div><CategoryBadge category={produce.category} /></div><h3 className="mt-5 font-display text-lg font-extrabold text-forest-deep">{produce.crop_name}</h3><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5" /> {produce.location}</p><div className="mt-5 flex items-end justify-between"><div><p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Direct price</p><p className="mt-1 font-display text-2xl font-extrabold text-amber">₹{formatINR(produce.price_per_kg)}<span className="font-sans text-xs font-semibold text-muted-foreground"> / kg</span></p></div><div className="text-right"><p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Available</p><p className="mt-1 text-sm font-extrabold text-forest-deep">{formatINR(produce.quantity_kg)} kg</p></div></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-mint"><div className="h-full rounded-full bg-forest" style={{ width: `${stock}%` }} /></div><div className="mt-4 flex items-center justify-between border-t border-border pt-4"><p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><UserRound className="size-3.5 text-forest" /> {produce.farmer_name}</p><Button onClick={() => onBuy(produce)} size="sm" className="rounded-lg bg-forest px-3 font-bold text-primary-foreground hover:bg-forest-deep">Buy direct</Button></div></article>; }

function BuyModal({ produce, onClose }: { produce: Produce; onClose: () => void }) { const [quantity, setQuantity] = useState(1); const total = quantity * produce.price_per_kg; return <div className="fixed inset-0 z-50 flex items-end justify-center bg-forest-deep/35 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={`Buy ${produce.crop_name}`}><div className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-6 shadow-2xl sm:rounded-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-forest">Direct checkout</p><h2 className="mt-1 font-display text-2xl font-extrabold text-forest-deep">{produce.crop_name}</h2><p className="mt-1 text-sm text-muted-foreground">₹{formatINR(produce.price_per_kg)} per kg · {produce.location}</p></div><Button variant="ghost" size="icon" aria-label="Close checkout" onClick={onClose} className="rounded-full"><X className="size-5" /></Button></div><div className="mt-6 rounded-xl bg-mint p-4"><div className="flex items-center justify-between"><p className="text-sm font-bold text-forest-deep">How much do you need?</p><p className="text-xs font-bold text-forest">Max {formatINR(produce.quantity_kg)} kg</p></div><div className="mt-4 flex items-center gap-3"><input aria-label="Quantity in kg" type="number" min="1" max={produce.quantity_kg} value={quantity} onChange={(event) => setQuantity(Math.min(produce.quantity_kg, Math.max(1, Number(event.target.value) || 1)))} className="h-12 w-28 rounded-xl border border-border bg-surface px-3 text-center text-lg font-extrabold text-forest-deep outline-none focus:ring-2 focus:ring-forest" /><span className="font-bold text-forest">kilograms</span></div></div><div className="mt-5 flex items-center justify-between border-b border-border pb-5"><span className="text-sm font-semibold text-muted-foreground">Your total</span><span className="font-display text-3xl font-extrabold text-forest-deep">₹{formatINR(total)}</span></div><div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-soft px-3 py-2 text-xs font-bold text-amber"><Check className="size-4" /> Zero middleman commission</div><Button onClick={() => { toast.success("Order request placed", { description: `${quantity} kg of ${produce.crop_name}` }); onClose(); }} className="mt-5 h-12 w-full rounded-xl bg-forest font-bold text-primary-foreground hover:bg-forest-deep">Place order <ShoppingBasket className="size-4" /></Button></div></div>; }

function AnalyticsView({ data, loading }: { data: Analytics[]; loading: boolean }) { const totalDirect = data.reduce((sum, item) => sum + item.farmer_earning, 0); const totalMargin = data.reduce((sum, item) => sum + item.mandi_margin, 0); return <div className="space-y-7"><div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]"><section className="rounded-2xl border border-border bg-surface p-5 shadow-krishi sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-forest">DBMS insights</p><h2 className="mt-1 font-display text-xl font-extrabold text-forest-deep">Average market prices</h2></div><div className="rounded-lg bg-mint px-3 py-2 text-xs font-bold text-forest">₹ / kg</div></div><div className="mt-7 h-[280px]">{loading ? <Skeleton className="h-full w-full" /> : <ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 10, right: 5, left: -18, bottom: 0 }}><defs><linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="category" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 12 }} formatter={(value) => [`₹${value}`, "Average price"]} /><Area type="monotone" dataKey="average_price" stroke="var(--chart-1)" strokeWidth={3} fill="url(#priceFill)" /></AreaChart></ResponsiveContainer>}</div></section><SavingsCard direct={totalDirect} margin={totalMargin} /></div><section className="rounded-2xl border border-border bg-surface p-5 shadow-krishi sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-forest">Category snapshot</p><h2 className="mt-1 font-display text-xl font-extrabold text-forest-deep">Where your produce stands</h2></div><BarChart3 className="size-5 text-forest" /></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{data.map((item) => <div key={item.category} className="rounded-xl bg-surface-muted p-4"><p className="text-xs font-bold text-muted-foreground">{item.category}</p><p className="mt-2 font-display text-2xl font-extrabold text-forest-deep">₹{formatINR(item.average_price)}</p><div className="mt-2 flex items-center gap-1 text-xs font-bold text-forest"><TrendingUp className="size-3.5" /> Direct average</div></div>)}</div></section></div>; }

function SavingsCard({ direct, margin }: { direct: number; margin: number }) { return <section className="relative overflow-hidden rounded-2xl bg-forest p-6 text-primary-foreground shadow-krishi sm:p-7"><div className="relative z-10"><div className="mb-10 flex items-center justify-between"><div className="grid size-11 place-items-center rounded-xl bg-mint text-forest"><IndianRupee className="size-5" /></div><span className="rounded-full bg-mint px-3 py-1.5 text-xs font-extrabold text-forest">+ 18.4% better</span></div><p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground/70">Middleman savings</p><h2 className="mt-2 max-w-xs font-display text-2xl font-extrabold leading-tight">Keep more of every harvest you sell.</h2><div className="mt-7 space-y-4"><div className="flex items-end justify-between border-b border-primary-foreground/15 pb-3"><span className="text-sm text-primary-foreground/70">Farmer earns directly</span><span className="font-display text-xl font-extrabold">₹{formatINR(direct)}</span></div><div className="flex items-end justify-between"><span className="text-sm text-primary-foreground/70">Traditional mandi margin</span><span className="font-display text-xl font-extrabold text-amber-soft">₹{formatINR(margin)}</span></div></div></div><div className="absolute -right-8 -top-8 size-40 rounded-full border-[18px] border-primary-foreground/10" /><div className="absolute -bottom-16 -right-12 size-48 rounded-full border-[22px] border-primary-foreground/10" /></section>; }