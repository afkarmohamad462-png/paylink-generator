import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link2, Upload, Copy, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const GenerateLinkForm = () => {
  const [productName, setProductName] = useState("");
  const [normalPrice, setNormalPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [finalPrice, setFinalPrice] = useState(0);
  
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [bankBriAccount, setBankBriAccount] = useState("");
  const [bankMandiriAccount, setBankMandiriAccount] = useState("");
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const [qrisPreview, setQrisPreview] = useState<string | null>(null);
  
  const [generating, setGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto calculate final price
  useEffect(() => {
    const normal = parseFloat(normalPrice) || 0;
    const discount = parseFloat(discountPercent) || 0;
    const final = normal - (normal * discount / 100);
    setFinalPrice(final);
  }, [normalPrice, discountPercent]);

  const togglePaymentMethod = (method: string) => {
    setPaymentMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const handleQrisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrisFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setQrisPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateSlug = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let slug = "";
    for (let i = 0; i < 8; i++) {
      slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return slug;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName || !normalPrice || paymentMethods.length === 0) {
      toast.error("Mohon lengkapi data yang diperlukan");
      return;
    }

    setGenerating(true);

    try {
      let qrisImageUrl = null;

      // Upload QRIS image if provided
      if (qrisFile && paymentMethods.includes("qris")) {
        const fileName = `qris-${Date.now()}-${qrisFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("qris-images")
          .upload(fileName, qrisFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("qris-images")
          .getPublicUrl(fileName);

        qrisImageUrl = urlData.publicUrl;
      }

      const slug = generateSlug();

      const { error } = await supabase.from("payment_links").insert({
        slug,
        product_name: productName,
        normal_price: parseFloat(normalPrice),
        discount_percent: parseFloat(discountPercent) || 0,
        final_price: finalPrice,
        payment_methods: paymentMethods,
        bank_bri_account: paymentMethods.includes("bri") ? bankBriAccount : null,
        bank_mandiri_account: paymentMethods.includes("mandiri") ? bankMandiriAccount : null,
        qris_image_url: qrisImageUrl,
      });

      if (error) throw error;

      const link = `${window.location.origin}/pay/${slug}`;
      setGeneratedLink(link);
      toast.success("Link pembayaran berhasil dibuat!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal membuat link pembayaran");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success("Link berhasil disalin!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    setProductName("");
    setNormalPrice("");
    setDiscountPercent("");
    setPaymentMethods([]);
    setBankBriAccount("");
    setBankMandiriAccount("");
    setQrisFile(null);
    setQrisPreview(null);
    setGeneratedLink(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (generatedLink) {
    return (
      <Card className="max-w-xl mx-auto border-border/50 shadow-lg animate-slide-up">
        <CardContent className="pt-8 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Link Berhasil Dibuat!</h2>
          <p className="text-muted-foreground mb-6">Bagikan link berikut kepada pembeli:</p>
          
          <div className="flex items-center gap-2 p-4 bg-accent rounded-xl mb-6">
            <Input
              value={generatedLink}
              readOnly
              className="bg-card border-0 text-center font-medium"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="shrink-0"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <Button onClick={resetForm} className="gradient-primary border-0">
            Buat Link Baru
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Link2 className="w-5 h-5 text-primary-foreground" />
          </div>
          Generate Link Pembayaran
        </CardTitle>
        <CardDescription>
          Buat link pembayaran unik untuk produk atau layanan Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Informasi Produk</h3>
            <div className="space-y-2">
              <Label htmlFor="productName">Nama Produk</Label>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Contoh: Kursus Web Development"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="normalPrice">Harga Normal (Rp)</Label>
                <Input
                  id="normalPrice"
                  type="number"
                  value={normalPrice}
                  onChange={(e) => setNormalPrice(e.target.value)}
                  placeholder="500000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Diskon (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="p-4 bg-accent rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Harga Akhir:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(finalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Metode Pembayaran</h3>
            <div className="space-y-4">
              {/* BRI */}
              <div className={`p-4 rounded-xl border transition-all ${
                paymentMethods.includes("bri") ? "border-primary bg-accent" : "border-border"
              }`}>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="bri"
                    checked={paymentMethods.includes("bri")}
                    onCheckedChange={() => togglePaymentMethod("bri")}
                  />
                  <Label htmlFor="bri" className="flex-1 cursor-pointer">Bank BRI</Label>
                </div>
                {paymentMethods.includes("bri") && (
                  <div className="mt-3 pl-7">
                    <Input
                      value={bankBriAccount}
                      onChange={(e) => setBankBriAccount(e.target.value)}
                      placeholder="Nomor Rekening BRI"
                    />
                  </div>
                )}
              </div>

              {/* Mandiri */}
              <div className={`p-4 rounded-xl border transition-all ${
                paymentMethods.includes("mandiri") ? "border-primary bg-accent" : "border-border"
              }`}>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="mandiri"
                    checked={paymentMethods.includes("mandiri")}
                    onCheckedChange={() => togglePaymentMethod("mandiri")}
                  />
                  <Label htmlFor="mandiri" className="flex-1 cursor-pointer">Bank Mandiri</Label>
                </div>
                {paymentMethods.includes("mandiri") && (
                  <div className="mt-3 pl-7">
                    <Input
                      value={bankMandiriAccount}
                      onChange={(e) => setBankMandiriAccount(e.target.value)}
                      placeholder="Nomor Rekening Mandiri"
                    />
                  </div>
                )}
              </div>

              {/* QRIS */}
              <div className={`p-4 rounded-xl border transition-all ${
                paymentMethods.includes("qris") ? "border-primary bg-accent" : "border-border"
              }`}>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="qris"
                    checked={paymentMethods.includes("qris")}
                    onCheckedChange={() => togglePaymentMethod("qris")}
                  />
                  <Label htmlFor="qris" className="flex-1 cursor-pointer">QRIS</Label>
                </div>
                {paymentMethods.includes("qris") && (
                  <div className="mt-3 pl-7">
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        qrisPreview ? "border-primary" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => document.getElementById("qrisInput")?.click()}
                    >
                      {qrisPreview ? (
                        <img src={qrisPreview} alt="QRIS Preview" className="max-h-40 mx-auto rounded-lg" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Upload gambar QRIS</p>
                        </>
                      )}
                    </div>
                    <input
                      id="qrisInput"
                      type="file"
                      accept="image/*"
                      onChange={handleQrisChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={generating || paymentMethods.length === 0}
            className="w-full gradient-primary border-0 shadow-lg hover:shadow-xl transition-all text-lg py-6"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Link2 className="w-5 h-5 mr-2" />
                Generate Link
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GenerateLinkForm;
