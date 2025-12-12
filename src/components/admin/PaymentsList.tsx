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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, CheckCircle2, XCircle, Clock, Eye, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Payment {
  id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_whatsapp: string;
  payment_method: string;
  proof_image_url: string | null;
  status: "pending" | "confirmed" | "rejected";
  created_at: string;
  payment_links: {
    product_name: string;
    final_price: number;
  };
}

const PaymentsList = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        payment_links (
          product_name,
          final_price
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Gagal memuat data pembayaran");
    } else {
      setPayments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const updateStatus = async (id: string, status: "confirmed" | "rejected") => {
    setUpdatingId(id);
    const { error } = await supabase
      .from("payments")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Gagal mengubah status");
    } else {
      toast.success(`Status berhasil diubah ke ${status === "confirmed" ? "Dikonfirmasi" : "Ditolak"}`);
      fetchPayments();
    }
    setUpdatingId(null);
  };

  const deletePayment = async (id: string) => {
    if (!confirm("Yakin ingin menghapus pembayaran ini?")) return;

    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Gagal menghapus pembayaran");
    } else {
      toast.success("Pembayaran berhasil dihapus");
      fetchPayments();
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
      timeStyle: "short",
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Dikonfirmasi
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="w-3 h-3 mr-1" />
            Ditolak
          </Badge>
        );
      default:
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "bri":
        return "Bank BRI";
      case "mandiri":
        return "Bank Mandiri";
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
    <>
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-foreground" />
            </div>
            Daftar Pembayaran
          </CardTitle>
          <CardDescription>
            Kelola semua pembayaran yang masuk
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Belum Ada Pembayaran</h3>
              <p className="text-muted-foreground">Pembayaran akan muncul di sini setelah pembeli mengirimnya</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pembeli</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/30">
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(payment.created_at)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{payment.buyer_name}</p>
                          <p className="text-xs text-muted-foreground">{payment.buyer_email}</p>
                          <p className="text-xs text-muted-foreground">{payment.buyer_whatsapp}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{payment.payment_links.product_name}</p>
                          <p className="text-sm text-primary font-semibold">
                            {formatCurrency(payment.payment_links.final_price)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{getMethodLabel(payment.payment_method)}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {payment.proof_image_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedProof(payment.proof_image_url)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {payment.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateStatus(payment.id, "confirmed")}
                                disabled={updatingId === payment.id}
                                className="text-success hover:text-success hover:bg-success/10"
                              >
                                {updatingId === payment.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateStatus(payment.id, "rejected")}
                                disabled={updatingId === payment.id}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletePayment(payment.id)}
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

      {/* Proof Image Dialog */}
      <Dialog open={!!selectedProof} onOpenChange={() => setSelectedProof(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bukti Pembayaran</DialogTitle>
          </DialogHeader>
          {selectedProof && (
            <img
              src={selectedProof}
              alt="Bukti Pembayaran"
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentsList;
