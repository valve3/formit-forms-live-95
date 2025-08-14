import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from '@/components/admin/UserManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Settings, User, Users, Lock } from 'lucide-react';

export const SettingsPanel = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [updating, setUpdating] = useState(false);

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      // TODO: Implement profile update API call
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Settings className="h-6 w-6" />
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your account and application settings</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          {profile?.role === 'admin' && (
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Profile Information
                {profile?.role === 'admin' && (
                  <Badge variant="secondary">Administrator</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <div>
                  <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
                    {profile?.role === 'admin' ? 'Administrator' : 'User'}
                  </Badge>
                </div>
              </div>

              <Button 
                onClick={handleUpdateProfile} 
                disabled={updating}
                className="w-full sm:w-auto"
              >
                {updating ? 'Updating...' : 'Update Profile'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Password Management</h3>
                <p className="text-muted-foreground mb-4">
                  Password management features coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {profile?.role === 'admin' && (
          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};