import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link2, Copy, Trash2, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentLink {
  id: string;
  slug: string;
  product_name: string;
  normal_price: number;
  discount_percent: number;
  final_price: number;
  payment_methods: string[];
  created_at: string;
}

const LinksList = () => {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("payment_links")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Gagal memuat data link");
    } else {
      setLinks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const copyLink = async (slug: string, id: string) => {
    const link = `${window.location.origin}/pay/${slug}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success("Link berhasil disalin!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteLink = async (id: string) => {
    if (!confirm("Yakin ingin menghapus link ini? Semua pembayaran terkait juga akan dihapus.")) return;

    const { error } = await supabase
      .from("payment_links")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Gagal menghapus link");
    } else {
      toast.success("Link berhasil dihapus");
      fetchLinks();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
    }).format(new Date(date));
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "bri":
        return "BRI";
      case "mandiri":
        return "Mandiri";
      case "qris":
        return "QRIS";
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardContent className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Link2 className="w-5 h-5 text-primary-foreground" />
          </div>
          Daftar Link Pembayaran
        </CardTitle>
        <CardDescription>
          Semua link pembayaran yang telah dibuat
        </CardDescription>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-center py-12">
            <Link2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Belum Ada Link</h3>
            <p className="text-muted-foreground">Buat link pertama Anda di tab Generate Link</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(link.created_at)}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{link.product_name}</p>
                      <p className="text-xs text-muted-foreground font-mono">/pay/{link.slug}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        {link.discount_percent > 0 && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatCurrency(link.normal_price)}
                          </p>
                        )}
                        <p className="font-semibold text-primary">
                          {formatCurrency(link.final_price)}
                        </p>
                        {link.discount_percent > 0 && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            -{link.discount_percent}%
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {link.payment_methods.map((method) => (
                          <Badge key={method} variant="outline" className="text-xs">
                            {getMethodLabel(method)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyLink(link.slug, link.id)}
                        >
                          {copiedId === link.id ? (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <a
                          href={`/pay/${link.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteLink(link.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LinksList;
