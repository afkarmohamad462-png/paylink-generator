import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Building2,
  QrCode,
  Upload,
  CheckCircle2,
  Loader2,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

interface PaymentLink {
  id: string;
  slug: string;
  product_name: string;
  normal_price: number;
  discount_percent: number;
  final_price: number;
  payment_methods: string[];
  bank_bri_account: string | null;
  bank_mandiri_account: string | null;
  qris_image_url: string | null;
}

const PaymentPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [selectedMethod, setSelectedMethod] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerWhatsapp, setBuyerWhatsapp] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentLink = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from("payment_links")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error || !data) {
        toast.error("Link pembayaran tidak ditemukan");
        setPaymentLink(null);
      } else {
        setPaymentLink(data as PaymentLink);
        if ((data as any).payment_methods?.length > 0) {
          setSelectedMethod((data as any).payment_methods[0]);
        }
      }
      setLoading(false);
    };

    fetchPaymentLink();
  }, [slug]);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success("Berhasil disalin!");
      setTimeout(() => setCopiedKey(null), 1200);
    } catch (e) {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);

      setCopiedKey(key);
      toast.success("Berhasil disalin!");
      setTimeout(() => setCopiedKey(null), 1200);
    }
  };
  const [qrisOpen, setQrisOpen] = useState(false);

  const downloadImage = async (url: string, filename = "qris.png") => {
    try {
      // coba fetch blob biar file-name rapi
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(blobUrl);
    } catch {
      // fallback kalau CORS: buka tab baru (user bisa save)
      window.open(url, "_blank");
    }
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProofPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!paymentLink || !selectedMethod) return;

    setSubmitting(true);

    try {
      let proofUrl: string | null = null;

      if (proofFile) {
        const fileName = `${Date.now()}-${proofFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("payment-proofs")
          .upload(fileName, proofFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("payment-proofs")
          .getPublicUrl(fileName);

        proofUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("payments").insert({
        payment_link_id: paymentLink.id,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_whatsapp: buyerWhatsapp,
        payment_method: selectedMethod,
        proof_image_url: proofUrl,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Pembayaran berhasil dikirim!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirim pembayaran. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!paymentLink) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Link Tidak Ditemukan</h2>
            <p className="text-muted-foreground">
              Link pembayaran tidak valid atau sudah tidak aktif.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full animate-slide-up">
          <CardContent className="pt-8 text-center">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Terima Kasih!</h2>
            <p className="text-muted-foreground mb-4">
              Pembayaran Anda telah dikirim dan sedang menunggu konfirmasi admin.
            </p>
            <p className="text-sm text-muted-foreground">
              Kami akan menghubungi via WhatsApp atau Email.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pageLink = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky top bar (mobile friendly) */}
      <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-lg px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-primary-foreground" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Pembayaran</p>
            <p className="font-semibold truncate">{paymentLink.product_name}</p>
          </div>

        {/* Copy link halaman */}
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => copyToClipboard(pageLink, "page-link")}
          >
            <Copy className="w-4 h-4 mr-2" />
            {copiedKey === "page-link" ? "Tersalin" : "Copy Link"}

            
          </Button>
        </div>
        {/* QRIS Fullscreen Modal */}
        {qrisOpen && paymentLink?.qris_image_url && (
          <div
            className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm"
            onClick={() => setQrisOpen(false)}
          >
            <div
              className="absolute inset-0 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top bar */}
              <div className="px-4 py-3 flex items-center justify-between text-white">
                <div className="min-w-0">
                  <p className="text-xs opacity-80">QRIS</p>
                  <p className="font-semibold truncate">{paymentLink.product_name}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() =>
                      downloadImage(paymentLink.qris_image_url!, `qris-${paymentLink.slug}.png`)
                    }
                  >
                    Download
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => setQrisOpen(false)}
                  >
                    Tutup
                  </Button>
                </div>
              </div>

              {/* Image area */}
              <div className="flex-1 px-4 pb-6 flex items-center justify-center">
                <img
                  src={paymentLink.qris_image_url}
                  alt="QRIS Fullscreen"
                  className="max-h-[82vh] w-auto max-w-full rounded-2xl bg-white p-2"
                />
              </div>

              <p className="text-center text-white/80 text-xs pb-5">
                Tap area gelap untuk menutup
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="mx-auto max-w-lg px-4 pt-4 pb-28 space-y-4">
        {/* Total hero */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-4">
          <p className="text-sm text-muted-foreground">Total yang harus dibayar</p>
          <div className="flex items-end justify-between gap-3 mt-1">
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(paymentLink.final_price)}
            </p>
            {paymentLink.discount_percent > 0 && (
              <span className="text-xs font-medium text-success bg-success/10 px-3 py-1 rounded-full">
                Diskon {paymentLink.discount_percent}%
              </span>
            )}
          </div>

          {paymentLink.discount_percent > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Harga normal{" "}
              <span className="line-through">{formatCurrency(paymentLink.normal_price)}</span>
            </p>
          )}
        </div>

        {/* Single main card */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          {/* Method */}
          <div className="p-4 border-b border-border/50">
            <h2 className="text-base font-semibold">Metode pembayaran</h2>
            <p className="text-sm text-muted-foreground mt-1">Pilih metode yang kamu pakai.</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {paymentLink.payment_methods.includes("bri") && (
                <button
                  type="button"
                  onClick={() => setSelectedMethod("bri")}
                  className={`px-3 py-2 rounded-xl border text-sm font-medium flex items-center gap-2 transition ${selectedMethod === "bri"
                      ? "border-primary bg-accent"
                      : "border-border/60 hover:border-primary/50"
                    }`}
                >
                  <Building2 className="w-4 h-4 text-primary" />
                  BRI
                </button>
              )}

              {paymentLink.payment_methods.includes("mandiri") && (
                <button
                  type="button"
                  onClick={() => setSelectedMethod("mandiri")}
                  className={`px-3 py-2 rounded-xl border text-sm font-medium flex items-center gap-2 transition ${selectedMethod === "mandiri"
                      ? "border-primary bg-accent"
                      : "border-border/60 hover:border-primary/50"
                    }`}
                >
                  <Building2 className="w-4 h-4 text-primary" />
                  Mandiri
                </button>
              )}

              {paymentLink.payment_methods.includes("qris") && (
                <button
                  type="button"
                  onClick={() => setSelectedMethod("qris")}
                  className={`px-3 py-2 rounded-xl border text-sm font-medium flex items-center gap-2 transition ${selectedMethod === "qris"
                      ? "border-primary bg-accent"
                      : "border-border/60 hover:border-primary/50"
                    }`}
                >
                  <QrCode className="w-4 h-4 text-primary" />
                  QRIS
                </button>
              )}
            </div>

            {selectedMethod && (
              <div className="mt-4 rounded-xl bg-accent p-4">
                {selectedMethod === "bri" && paymentLink.bank_bri_account && (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">Transfer ke rekening BRI</p>

                      {/* Tap-to-copy juga */}
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(paymentLink.bank_bri_account!, "rekening-bri")
                        }
                        className="mt-2 text-left w-full"
                      >
                        <p className="text-xl font-bold font-mono tracking-wide break-all">
                          {paymentLink.bank_bri_account}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tap nomor rekening untuk menyalin.
                        </p>
                      </button>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0 rounded-xl"
                      onClick={() =>
                        copyToClipboard(paymentLink.bank_bri_account!, "rekening-bri")
                      }
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copiedKey === "rekening-bri" ? "Tersalin" : "Copy"}
                    </Button>
                  </div>
                )}

                {selectedMethod === "mandiri" && paymentLink.bank_mandiri_account && (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">
                        Transfer ke rekening Mandiri
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(paymentLink.bank_mandiri_account!, "rekening-mandiri")
                        }
                        className="mt-2 text-left w-full"
                      >
                        <p className="text-xl font-bold font-mono tracking-wide break-all">
                          {paymentLink.bank_mandiri_account}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tap nomor rekening untuk menyalin.
                        </p>
                      </button>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0 rounded-xl"
                      onClick={() =>
                        copyToClipboard(paymentLink.bank_mandiri_account!, "rekening-mandiri")
                      }
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copiedKey === "rekening-mandiri" ? "Tersalin" : "Copy"}
                    </Button>
                  </div>
                )}

                {selectedMethod === "qris" && paymentLink.qris_image_url && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">Scan QRIS untuk bayar</p>

                    <button
                      type="button"
                      onClick={() => setQrisOpen(true)}
                      className="block mx-auto"
                      aria-label="Perbesar QRIS"
                    >
                      <img
                        src={paymentLink.qris_image_url}
                        alt="QRIS"
                        className="w-full max-w-[260px] mx-auto rounded-xl border border-border shadow-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-2">Tap QR untuk perbesar</p>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Buyer info */}
          <div className="p-4 border-b border-border/50">
            <h2 className="text-base font-semibold">Data pembeli</h2>
            <p className="text-sm text-muted-foreground mt-1">Dipakai untuk konfirmasi.</p>

            <div className="mt-4 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Nama lengkap</Label>
                <Input
                  id="name"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={buyerWhatsapp}
                  onChange={(e) => setBuyerWhatsapp(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>
            </div>
          </div>

          {/* Proof */}
          <div className="p-4">
            <h2 className="text-base font-semibold">Bukti pembayaran</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Upload screenshot/foto bukti transfer.
            </p>

            <div className="mt-4">
              <div
                className={`rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition ${proofPreview
                    ? "border-primary bg-accent"
                    : "border-border/60 hover:border-primary/50"
                  }`}
                onClick={() => document.getElementById("proof")?.click()}
              >
                {proofPreview ? (
                  <img
                    src={proofPreview}
                    alt="Preview"
                    className="w-full max-h-72 object-contain rounded-xl"
                  />
                ) : (
                  <div className="py-4">
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="font-medium">Klik untuk upload bukti</p>
                    <p className="text-sm text-muted-foreground mt-1">PNG/JPG hingga 5MB</p>
                  </div>
                )}
              </div>
              <input
                id="proof"
                type="file"
                accept="image/*"
                onChange={handleProofChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Sticky bottom submit */}
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/90 backdrop-blur">
          <div className="mx-auto max-w-lg px-4 py-3 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-semibold">{formatCurrency(paymentLink.final_price)}</p>
            </div>

            <Button
              type="submit"
              disabled={submitting || !selectedMethod || !buyerName || !buyerEmail || !buyerWhatsapp}
              className="flex-[1.2] gradient-primary border-0 shadow-lg hover:shadow-xl transition-all py-6 rounded-xl"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Kirim"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PaymentPage;
