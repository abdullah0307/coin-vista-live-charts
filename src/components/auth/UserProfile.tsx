
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, LogOut } from "lucide-react";

const UserProfile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Profile
        </CardTitle>
        <CardDescription>Manage your account information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Email</p>
            <p>{currentUser?.email}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Account created</p>
            <p>{currentUser?.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : "Unknown"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Last sign in</p>
            <p>{currentUser?.metadata.lastSignInTime ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString() : "Unknown"}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            className="w-full mt-4"
            disabled={isLoggingOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
