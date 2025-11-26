import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login({ onLogin }: { onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4">
      <Card className="w-full max-w-sm shadow-xl border border-gray-200">
        
        <CardHeader className="text-center">
          <img
            src="/logo.png"    // Tu logo debe estar en /public/logo.png
            alt="MYPSICO"
            className="w-20 mx-auto mb-3 opacity-90"
          />
          <CardTitle className="text-xl font-light tracking-[0.25em]">
            MYPSICO
          </CardTitle>
          <CardDescription className="text-gray-500 text-sm">
            Acceso seguro
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <Input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button className="w-full tracking-wider" type="submit">
              Ingresar
            </Button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-3 hover:text-gray-700 cursor-pointer">
            ¿Olvidaste tu contraseña?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
