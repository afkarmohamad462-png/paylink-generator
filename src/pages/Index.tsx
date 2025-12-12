import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreditCard, Link2, BarChart3, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">PayLink</span>
          </div>
          <Link to="/admin">
            <Button variant="default" className="gradient-primary border-0 shadow-md hover:shadow-lg transition-all">
              Dashboard Admin
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Sistem Pembayaran Aman & Terpercaya
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 leading-tight">
              Generate Link Pembayaran{" "}
              <span className="text-primary">Dalam Hitungan Detik</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Buat link pembayaran profesional dengan mudah. Dukung Bank Transfer (BRI, Mandiri) dan QRIS untuk kemudahan transaksi pelanggan Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/admin">
                <Button size="lg" className="gradient-primary border-0 shadow-lg hover:shadow-xl transition-all text-lg px-8">
                  Mulai Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola pembayaran dengan efisien
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Link2 className="w-6 h-6" />}
              title="Link Unik Otomatis"
              description="Setiap link dibuat secara otomatis dengan URL unik yang dapat langsung dibagikan ke pembeli."
              delay="0"
            />
            <FeatureCard
              icon={<CreditCard className="w-6 h-6" />}
              title="Multi Metode Pembayaran"
              description="Dukung Bank Transfer (BRI & Mandiri) dan QRIS untuk kemudahan pembayaran pelanggan."
              delay="100"
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Dashboard Lengkap"
              description="Kelola semua pembayaran dalam satu dashboard dengan status tracking yang jelas."
              delay="200"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 PayLink. Sistem Generate Link Pembayaran.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  delay 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay: string;
}) => (
  <div 
    className="bg-card rounded-2xl p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-border/50 animate-slide-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Index;
