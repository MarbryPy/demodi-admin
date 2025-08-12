import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/lib/auth";
import { Lock, Gamepad2 } from "lucide-react";

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      toast({
        title: "Login successful",
        description: "Welcome to the Game Card Manager",
      });
      onLoginSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="bg-white shadow-lg">
          <CardContent className="pt-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center mx-auto">
                <Gamepad2 className="text-white h-8 w-8" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">Game Card Manager</h1>
              <p className="text-gray-600">Admin Portal</p>
            </div>

            {/* Login Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-900">
                  Admin Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    data-testid="input-password"
                    className="form-input pr-10"
                    {...form.register("password")}
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1" data-testid="error-password">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                data-testid="button-login"
                className="btn-primary w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <LoadingSpinner className="mr-2" size="sm" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center">
              <p className="text-xs text-gray-500">Session expires after 8 hours</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
