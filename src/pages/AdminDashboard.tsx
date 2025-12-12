import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Link2, List } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import GenerateLinkForm from "@/components/admin/GenerateLinkForm";
import PaymentsList from "@/components/admin/PaymentsList";
import LinksList from "@/components/admin/LinksList";

type Role = "admin" | "user";

async function getUserRole(userId: string): Promise<Role | null> {
    const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

    if (error) return null;
    return (data?.role as Role) ?? null;
}

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("generate");
    const [checking, setChecking] = useState(true);
    const [email, setEmail] = useState<string>("");

    useEffect(() => {
        let mounted = true;

        (async () => {
            const { data } = await supabase.auth.getUser();

            // belum login
            if (!data.user) {
                navigate("/login", { replace: true });
                return;
            }

            // cek role
            const role = await getUserRole(data.user.id);

            // kalau bukan admin, lempar ke dashboard user
            if (role !== "admin") {
                navigate("/dashboard", { replace: true });
                return;
            }

            if (!mounted) return;
            setEmail(data.user.email ?? "");
            setChecking(false);
        })();

        return () => {
            mounted = false;
        };
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login", { replace: true });
    };

    if (checking) {
        return (
            <div className="min-h-screen grid place-items-center bg-background">
                <div className="text-sm text-muted-foreground">Memuat dashboard admin...</div>
            </div>
        );
    }

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
                        <span className="hidden sm:inline text-xs text-muted-foreground">
                            {email}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground bg-accent px-3 py-1.5 rounded-full">
                            Dashboard Admin
                        </span>
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium px-3 py-1.5 rounded-full border border-border/60 hover:bg-accent"
                        >
                            Logout
                        </button>
                    </div>
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

export default AdminDashboard;
