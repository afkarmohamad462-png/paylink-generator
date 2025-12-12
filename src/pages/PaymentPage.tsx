import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Building2, QrCode, Upload, CheckCircle2, Loader2 } from "lucide-react";
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
      } else {
        setPaymentLink(data);
        if (data.payment_methods.length > 0) {
          setSelectedMethod(data.payment_methods[0]);
        }
      }
      setLoading(false);
    };

    fetchPaymentLink();
  }, [slug]);

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProofPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentLink || !selectedMethod) return;

    setSubmitting(true);

    try {
      let proofUrl = null;

      if (proofFile) {
        const fileName = `${Date.now()}-${proofFile.name}`;
        const { error: uploadError, data: uploadData } = await supabase.storage
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
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim pembayaran. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 text-center">
            <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Link Tidak Ditemukan</h2>
            <p className="text-muted-foreground">Link pembayaran tidak valid atau sudah tidak aktif.</p>
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
              Pembayaran Anda telah dikirim dan sedang menunggu konfirmasi dari admin.
            </p>
            <p className="text-sm text-muted-foreground">
              Kami akan menghubungi Anda melalui WhatsApp atau Email.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Pembayaran</h1>
        </div>

        {/* Product Info */}
        <Card className="border-border/50 shadow-md animate-fade-in">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Detail Produk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">{paymentLink.product_name}</h3>
            </div>
            <div className="space-y-2">
              {paymentLink.discount_percent > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Harga Normal</span>
                  <span className="text-muted-foreground line-through">
                    {formatCurrency(paymentLink.normal_price)}
                  </span>
                </div>
              )}
              {paymentLink.discount_percent > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Diskon</span>
                  <span className="text-success font-medium">-{paymentLink.discount_percent}%</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="font-semibold text-foreground">Total Bayar</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(paymentLink.final_price)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method */}
          <Card className="border-border/50 shadow-md animate-fade-in" style={{ animationDelay: "100ms" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="space-y-3">
                {paymentLink.payment_methods.includes("bri") && (
                  <label
                    htmlFor="bri"
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedMethod === "bri"
                        ? "border-primary bg-accent"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="bri" id="bri" />
                    <Building2 className="w-6 h-6 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Bank BRI</p>
                      <p className="text-sm text-muted-foreground">Transfer ke rekening BRI</p>
                    </div>
                  </label>
                )}
                {paymentLink.payment_methods.includes("mandiri") && (
                  <label
                    htmlFor="mandiri"
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedMethod === "mandiri"
                        ? "border-primary bg-accent"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="mandiri" id="mandiri" />
                    <Building2 className="w-6 h-6 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Bank Mandiri</p>
                      <p className="text-sm text-muted-foreground">Transfer ke rekening Mandiri</p>
                    </div>
                  </label>
                )}
                {paymentLink.payment_methods.includes("qris") && (
                  <label
                    htmlFor="qris"
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedMethod === "qris"
                        ? "border-primary bg-accent"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="qris" id="qris" />
                    <QrCode className="w-6 h-6 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">QRIS</p>
                      <p className="text-sm text-muted-foreground">Scan QR untuk bayar</p>
                    </div>
                  </label>
                )}
              </RadioGroup>

              {/* Payment Instructions */}
              {selectedMethod && (
                <div className="mt-6 p-4 bg-accent rounded-xl animate-fade-in">
                  {selectedMethod === "bri" && paymentLink.bank_bri_account && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Transfer ke rekening BRI:</p>
                      <p className="text-xl font-bold text-foreground font-mono">{paymentLink.bank_bri_account}</p>
                    </div>
                  )}
                  {selectedMethod === "mandiri" && paymentLink.bank_mandiri_account && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Transfer ke rekening Mandiri:</p>
                      <p className="text-xl font-bold text-foreground font-mono">{paymentLink.bank_mandiri_account}</p>
                    </div>
                  )}
                  {selectedMethod === "qris" && paymentLink.qris_image_url && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">Scan QR Code di bawah ini:</p>
                      <img
                        src={paymentLink.qris_image_url}
                        alt="QRIS Code"
                        className="max-w-[250px] mx-auto rounded-lg border border-border"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Buyer Info */}
          <Card className="border-border/50 shadow-md animate-fade-in" style={{ animationDelay: "200ms" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Data Pembeli</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
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
            </CardContent>
          </Card>

          {/* Proof Upload */}
          <Card className="border-border/50 shadow-md animate-fade-in" style={{ animationDelay: "300ms" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Bukti Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    proofPreview ? "border-primary bg-accent" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => document.getElementById("proof")?.click()}
                >
                  {proofPreview ? (
                    <img src={proofPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                  ) : (
                    <>
                      <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Klik untuk upload bukti pembayaran
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG hingga 5MB</p>
                    </>
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
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={submitting || !selectedMethod || !buyerName || !buyerEmail || !buyerWhatsapp}
            className="w-full gradient-primary border-0 shadow-lg hover:shadow-xl transition-all text-lg py-6"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Mengirim...
              </>
            ) : (
              "Kirim Pembayaran"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
