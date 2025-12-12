import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CreditCard, Link2, List, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import GenerateLinkForm from "@/components/admin/GenerateLinkForm";
import LinksList from "@/components/admin/LinksList";

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("generate");
  const [userEmail, setUserEmail] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/login";
        return;
      }
      setUserEmail(data.user.email ?? "");
    });
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Gagal logout");
      return;
    }
    toast.success("Logout berhasil");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">MyLink</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="inline-flex text-sm font-medium text-muted-foreground bg-accent px-3 py-1.5 rounded-full">
                Dashboard User
              </span>
              {userEmail && (
                <div className="text-xs text-muted-foreground mt-1">{userEmail}</div>
              )}
            </div>

            <Button variant="outline" onClick={handleLogout} className="rounded-xl">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Buat Link Pembayaran</h1>
          <p className="text-muted-foreground">Generate link dan bagikan ke pembeli.</p>
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
          </TabsList>

          <TabsContent value="generate" className="animate-fade-in">
            <GenerateLinkForm />
          </TabsContent>

          <TabsContent value="links" className="animate-fade-in">
            <LinksList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserDashboard;
