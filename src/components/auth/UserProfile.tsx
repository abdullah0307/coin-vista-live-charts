
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut, Upload } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";

const UserProfile = () => {
  const { currentUser, logout, updateProfilePicture } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validImageTypes.includes(file.type)) {
      alert("Please select a valid image file (JPG, PNG, or GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      await updateProfilePicture(file);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getUserInitial = () => {
    return currentUser?.email?.[0]?.toUpperCase() || "U";
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
        <div className="flex flex-col items-center mb-6">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="relative w-24 h-24 rounded-full p-0 overflow-hidden">
                <Avatar className="w-24 h-24">
                  {currentUser?.photoURL ? (
                    <AvatarImage src={currentUser.photoURL} alt="Profile picture" />
                  ) : (
                    <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                      {getUserInitial()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="h-6 w-6 text-white" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <Button 
                onClick={triggerFileInput} 
                variant="outline" 
                size="sm"
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? "Uploading..." : "Change Picture"}
              </Button>
            </PopoverContent>
          </Popover>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/gif"
            className="hidden"
          />
        </div>

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
