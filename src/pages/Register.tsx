import { useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Eye, EyeOff } from "lucide-react";

const RegisterPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Password tidak sama");
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.signUp({ email, password });

        if (error) setError("Gagal mendaftar. Email sudah digunakan atau tidak valid.");
        else setSuccess("Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.");

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <Card className="w-full max-w-sm shadow-xl border rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold text-gray-800">
                        Register 
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        {/* Password */}
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
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Toggle>
                        </div>

                        {/* Konfirmasi Password */}
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Konfirmasi Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="pr-12"
                            />

                            <Toggle
                                pressed={showConfirmPassword}
                                onPressedChange={setShowConfirmPassword}
                                variant="outline"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 p-0"
                                aria-label={
                                    showConfirmPassword ? "Sembunyikan konfirmasi password" : "Lihat konfirmasi password"
                                }
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Toggle>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        {success && <p className="text-green-600 text-sm">{success}</p>}

                        <Button type="submit" className="w-full py-2 rounded-xl" disabled={loading}>
                            {loading ? "Memproses..." : "Daftar"}
                        </Button>

                        <p className="text-center text-sm text-gray-600 mt-2">
                            Sudah punya akun?
                            <a href="/login" className="text-blue-600 ml-1">
                                Login
                            </a>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default RegisterPage;
