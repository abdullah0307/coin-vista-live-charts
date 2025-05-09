
import UserProfile from "@/components/auth/UserProfile";

const Profile = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <UserProfile />
      </div>
    </div>
  );
};

export default Profile;
