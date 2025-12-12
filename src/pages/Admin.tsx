import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Link2, List } from "lucide-react";
import { Link } from "react-router-dom";
import GenerateLinkForm from "@/components/admin/GenerateLinkForm";
import PaymentsList from "@/components/admin/PaymentsList";
import LinksList from "@/components/admin/LinksList";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("generate");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">PayLink</span>
          </Link>
          <span className="text-sm font-medium text-muted-foreground bg-accent px-3 py-1.5 rounded-full">
            Dashboard Admin
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Admin</h1>
          <p className="text-muted-foreground">Kelola link pembayaran dan transaksi Anda</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border/50 p-1 rounded-xl">
            <TabsTrigger 
              value="generate" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground rounded-lg px-6"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Generate Link
            </TabsTrigger>
            <TabsTrigger 
              value="links" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground rounded-lg px-6"
            >
              <List className="w-4 h-4 mr-2" />
              Daftar Link
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground rounded-lg px-6"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pembayaran
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="animate-fade-in">
            <GenerateLinkForm />
          </TabsContent>

          <TabsContent value="links" className="animate-fade-in">
            <LinksList />
          </TabsContent>

          <TabsContent value="payments" className="animate-fade-in">
            <PaymentsList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
