
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { login, currentUser, sendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [resendingEmail, setResendingEmail] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const user = await login(values.email, values.password);
      if (user) {
        navigate("/");
      } else {
        // If login returns null, it might be due to email not verified
        setUserEmail(values.email);
        setVerificationNeeded(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!currentUser) return;
    
    setResendingEmail(true);
    try {
      await sendVerificationEmail(currentUser);
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Login to CoinVista</h1>
        <p className="text-muted-foreground mt-2">
          Enter your credentials to access your dashboard
        </p>
      </div>

      {verificationNeeded && (
        <Alert className="mb-4 bg-muted border-primary">
          <Mail className="h-5 w-5" />
          <AlertTitle>Email verification required</AlertTitle>
          <AlertDescription>
            Your email needs to be verified before logging in. Please check your inbox for the verification link or log in after verification.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              "Logging in..."
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" /> Login
              </>
            )}
          </Button>

          {verificationNeeded && currentUser && (
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleResendVerification}
              disabled={resendingEmail}
            >
              {resendingEmail ? "Sending..." : "Resend verification email"}
            </Button>
          )}
        </form>
      </Form>

      <div className="mt-4 text-center text-sm">
        <p>
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
