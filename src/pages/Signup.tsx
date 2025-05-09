
import SignupForm from "@/components/auth/SignupForm";
import { Card, CardContent } from "@/components/ui/card";

const Signup = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <SignupForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
