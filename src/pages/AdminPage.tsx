import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  LogOut,
  Search,
  Star,
  Users,
  TrendingUp,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { SERVICES } from "@/lib/feedback-schema";
import { toast } from "sonner";

type Row = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  account_number: string | null;
  rating: number;
  services_used: string[];
  feedback_comment: string;
  consent_given: boolean;
  status: string;
};

const GOLD = "#FFD700";
const COLORS = [GOLD, "#000000", "#9CA3AF", "#10B981", "#3B82F6", "#EF4444"];

export function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [consentFilter, setConsentFilter] = useState<"all" | "yes" | "no">("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["feedback"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Row[];
    },
    enabled: isAdmin === true,
  });

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        const full = `${r.first_name} ${r.last_name}`.toLowerCase();
        if (
          !full.includes(q) &&
          !r.first_name.toLowerCase().includes(q) &&
          !r.last_name.toLowerCase().includes(q) &&
          !(r.account_number || "").toLowerCase().includes(q) &&
          !r.email.toLowerCase().includes(q)
        )
          return false;
      }
      if (serviceFilter !== "all" && !r.services_used.includes(serviceFilter)) return false;
      if (ratingFilter !== "all" && r.rating !== Number(ratingFilter)) return false;
      if (consentFilter === "yes" && !r.consent_given) return false;
      if (consentFilter === "no" && r.consent_given) return false;
      return true;
    });
  }, [rows, search, serviceFilter, ratingFilter, consentFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const stats = useMemo(() => {
    const total = rows.length;
    const avg = total ? rows.reduce((s, r) => s + r.rating, 0) / total : 0;
    const satisfied = rows.filter((r) => r.rating >= 4).length;
    const satPct = total ? Math.round((satisfied / total) * 100) : 0;
    const serviceCounts: Record<string, number> = {};
    SERVICES.forEach((s) => (serviceCounts[s] = 0));
    rows.forEach((r) => r.services_used.forEach((s) => (serviceCounts[s] = (serviceCounts[s] || 0) + 1)));
    const mostUsed =
      Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    const ratingDist = [1, 2, 3, 4, 5].map((n) => ({
      rating: `${n}★`,
      count: rows.filter((r) => r.rating === n).length,
    }));
    const consentYes = rows.filter((r) => r.consent_given).length;
    const consentNo = total - consentYes;

    const months: { label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "short" });
      const count = rows.filter((r) => {
        const dt = new Date(r.created_at);
        return dt.getFullYear() === d.getFullYear() && dt.getMonth() === d.getMonth();
      }).length;
      months.push({ label, count });
    }

    const serviceData = Object.entries(serviceCounts).map(([name, value]) => ({ name, value }));
    return { total, avg, satPct, mostUsed, ratingDist, consentYes, consentNo, months, serviceData };
  }, [rows]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const triggerDownload = (filename: string, href: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.click();
  };

  const exportCSV = () => {
    const headers = ["Date", "First Name", "Last Name", "Email", "Account", "Rating", "Services", "Consent", "Comment"];
    const lines = [headers.join(",")];
    filtered.forEach((r) => {
      lines.push(
        [
          new Date(r.created_at).toISOString(),
          r.first_name,
          r.last_name,
          r.email,
          r.account_number || "",
          r.rating,
          `"${r.services_used.join("; ")}"`,
          r.consent_given ? "Yes" : "No",
          `"${r.feedback_comment.replace(/"/g, '""')}"`,
        ].join(",")
      );
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    triggerDownload("duxbank-feedback.csv", URL.createObjectURL(blob));
    toast.success("CSV exported");
  };

  const exportXLSX = () => {
    const sheet = XLSX.utils.json_to_sheet(
      filtered.map((r) => ({
        Date: new Date(r.created_at).toLocaleString(),
        "First Name": r.first_name,
        "Last Name": r.last_name,
        Email: r.email,
        Account: r.account_number || "",
        Rating: r.rating,
        Services: r.services_used.join("; "),
        Consent: r.consent_given ? "Yes" : "No",
        Comment: r.feedback_comment,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Feedback");
    XLSX.writeFile(wb, "duxbank-feedback.xlsx");
    toast.success("Excel exported");
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFillColor(255, 215, 0);
    doc.rect(0, 0, doc.internal.pageSize.width, 22, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("Duxbank Microfinance — Customer Feedback Report", 14, 14);
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(`Generated ${new Date().toLocaleString()} • ${filtered.length} records`, 14, 28);
    autoTable(doc, {
      startY: 34,
      head: [["Date", "Name", "Email", "Acct", "Rating", "Services", "Consent", "Comment"]],
      body: filtered.map((r) => [
        new Date(r.created_at).toLocaleDateString(),
        `${r.first_name} ${r.last_name}`,
        r.email,
        r.account_number || "—",
        `${r.rating}★`,
        r.services_used.join(", "),
        r.consent_given ? "Yes" : "No",
        r.feedback_comment.slice(0, 80),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 0, 0], textColor: 255 },
    });
    doc.save("duxbank-feedback.pdf");
    toast.success("PDF exported");
  };

  const feedbackUrl = `${window.location.origin}/feedback`;
  const [qrUrl, setQrUrl] = useState("");
  useEffect(() => {
    if (feedbackUrl) QRCode.toDataURL(feedbackUrl, { width: 256, margin: 1 }).then(setQrUrl);
  }, [feedbackUrl]);

  if (isAdmin === false) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-xl font-bold mb-2">Access denied</h2>
          <p className="text-muted-foreground mb-4">
            This account does not have admin privileges.
          </p>
          <Button onClick={signOut} variant="outline">
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  if (isAdmin === null || isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-muted-foreground">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="bg-secondary text-secondary-foreground border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <Badge className="bg-gold text-secondary hover:bg-gold">
              <ShieldCheck className="h-3 w-3 mr-1" /> Admin
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-white hover:text-secondary">
              <Link to="/">View site</Link>
            </Button>
            <Button onClick={signOut} variant="ghost" size="sm" className="text-white hover:text-secondary">
              <LogOut className="h-4 w-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Feedback" value={stats.total} />
          <StatCard icon={Star} label="Average Rating" value={stats.avg.toFixed(2)} />
          <StatCard icon={TrendingUp} label="Satisfaction" value={`${stats.satPct}%`} />
          <StatCard icon={ShieldCheck} label="Most Used Service" value={stats.mostUsed} small />
        </div>

        {/* Consent cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => { setConsentFilter("yes"); setPage(1); }}
            className="rounded-2xl border bg-card p-5 text-left hover:shadow-gold transition-shadow"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <div>
                <div className="text-2xl font-bold">{stats.consentYes}</div>
                <div className="text-sm text-muted-foreground">Consented Feedback</div>
              </div>
            </div>
          </button>
          <button
            onClick={() => { setConsentFilter("no"); setPage(1); }}
            className="rounded-2xl border bg-card p-5 text-left hover:shadow-gold transition-shadow"
          >
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{stats.consentNo}</div>
                <div className="text-sm text-muted-foreground">Unconsented Feedback</div>
              </div>
            </div>
          </button>
        </div>

        <Tabs defaultValue="feedback" className="space-y-4">
          <TabsList className="bg-card">
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="exports">Exports & QR</TabsTrigger>
          </TabsList>

          {/* Feedback table */}
          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between flex-wrap gap-3">
                  <span>Feedback Management</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {filtered.length} of {rows.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-4 gap-2">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search name, account, email…"
                      className="pl-9"
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                  </div>
                  <Select value={serviceFilter} onValueChange={(v) => { setServiceFilter(v); setPage(1); }}>
                    <SelectTrigger><SelectValue placeholder="Service" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All services</SelectItem>
                      {SERVICES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={ratingFilter} onValueChange={(v) => { setRatingFilter(v); setPage(1); }}>
                    <SelectTrigger><SelectValue placeholder="Rating" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All ratings</SelectItem>
                      {[5, 4, 3, 2, 1].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n} stars</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 text-sm">
                  <ConsentChip active={consentFilter === "all"} onClick={() => setConsentFilter("all")}>All</ConsentChip>
                  <ConsentChip active={consentFilter === "yes"} onClick={() => setConsentFilter("yes")}>Consented</ConsentChip>
                  <ConsentChip active={consentFilter === "no"} onClick={() => setConsentFilter("no")}>Not consented</ConsentChip>
                </div>

                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Services</TableHead>
                        <TableHead>Consent</TableHead>
                        <TableHead className="min-w-[220px]">Comment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paged.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                            No feedback yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paged.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="whitespace-nowrap text-xs">
                              {new Date(r.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-medium">
                              {r.first_name} {r.last_name}
                            </TableCell>
                            <TableCell className="text-xs">{r.email}</TableCell>
                            <TableCell className="text-xs">{r.account_number || "—"}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {r.rating}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs">
                              {r.services_used.length ? r.services_used.join(", ") : "—"}
                            </TableCell>
                            <TableCell>
                              {r.consent_given ? (
                                <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 border-0">
                                  Yes
                                </Badge>
                              ) : (
                                <Badge variant="secondary">No</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs max-w-md truncate">
                              {r.feedback_comment}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Rating Distribution</CardTitle></CardHeader>
              <CardContent className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.ratingDist}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill={GOLD} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Monthly Trend</CardTitle></CardHeader>
              <CardContent className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.months}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#000" strokeWidth={2} dot={{ fill: GOLD, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Service Usage</CardTitle></CardHeader>
              <CardContent className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.serviceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={120} />
                    <Tooltip />
                    <Bar dataKey="value" fill={GOLD} radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Consent Distribution</CardTitle></CardHeader>
              <CardContent className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Consented", value: stats.consentYes },
                        { name: "Not consented", value: stats.consentNo },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label
                    >
                      {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exports & QR */}
          <TabsContent value="exports" className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Export Reports</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Exports honor the currently active filters ({filtered.length} records).
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={exportXLSX} className="bg-gold text-secondary hover:bg-gold-dark">
                    <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
                  </Button>
                  <Button onClick={exportPDF} variant="secondary">
                    <FileText className="h-4 w-4 mr-1" /> PDF
                  </Button>
                  <Button onClick={exportCSV} variant="outline">
                    <Download className="h-4 w-4 mr-1" /> CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Public Feedback QR</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center gap-3">
                {qrUrl && <img src={qrUrl} alt="Feedback QR" className="rounded-lg border" />}
                <p className="text-xs text-muted-foreground break-all text-center">{feedbackUrl}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => qrUrl && triggerDownload("duxbank-feedback-qr.png", qrUrl)}
                >
                  <Download className="h-4 w-4 mr-1" /> Download PNG
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  small,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  small?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border p-5 flex items-center gap-4"
    >
      <div className="h-12 w-12 rounded-xl bg-gold/15 flex items-center justify-center">
        <Icon className="h-6 w-6 text-gold" />
      </div>
      <div>
        <div className={small ? "text-base font-semibold" : "text-2xl font-bold"}>{value}</div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </motion.div>
  );
}

function ConsentChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
        active ? "bg-secondary text-secondary-foreground border-secondary" : "bg-card hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}
