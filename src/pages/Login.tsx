
import LoginForm from "@/components/auth/LoginForm";
import { Card, CardContent } from "@/components/ui/card";

const Login = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
