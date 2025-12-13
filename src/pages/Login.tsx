import { useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

type Role = "admin" | "user";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError("Email atau password salah");
            setLoading(false);
            return;
        }

        const userId = data.user?.id;
        if (!userId) {
            setError("Gagal mengambil data user. Coba login ulang.");
            setLoading(false);
            return;
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .single();

        if (profileError) {
            window.location.href = "/dashboard";
            return;
        }

        const role = (profile?.role as Role | null) ?? "user";
        window.location.href = role === "admin" ? "/admin" : "/dashboard";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <Card className="w-full max-w-sm shadow-xl border rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold text-gray-800">
                        Login
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        {/* Password + toggle icon */}
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pr-12"
                            />

                            <Toggle
                                pressed={showPassword}
                                onPressedChange={setShowPassword}
                                variant="outline"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 p-0"
                                aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Toggle>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        {/* Tombol Masuk */}
                        <Button type="submit" className="w-full py-2 rounded-xl" disabled={loading}>
                            {loading ? "Memproses..." : "Masuk"}
                        </Button>

                        {/* Tombol Daftar (di bawah Masuk) */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full py-2 rounded-xl"
                            asChild
                        >
                            <Link to="/register">Daftar</Link>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;
