
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, User, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface UserCardProps {
  profile: Profile;
  onUpdateRole: (userId: string, newRole: string) => void;
  onDeleteUser: (userId: string) => void;
  deletingUserId: string | null;
}

export const UserCard = ({ profile, onUpdateRole, onDeleteUser, deletingUserId }: UserCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          {profile.role === 'admin' ? (
            <Shield className="h-5 w-5 text-white" />
          ) : (
            <User className="h-5 w-5 text-white" />
          )}
        </div>
        <div>
          <div className="font-medium text-gray-900">
            {profile.full_name || 'No name'}
          </div>
          <div className="text-sm text-gray-600">{profile.email}</div>
          <div className="text-xs text-gray-500">
            Joined {new Date(profile.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
          {profile.role}
        </Badge>
        <Select
          value={profile.role}
          onValueChange={(newRole) => onUpdateRole(profile.id, newRole)}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={deletingUserId === profile.id}
            >
              {deletingUserId === profile.id ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {profile.full_name || profile.email}? 
                This action cannot be undone and will remove all their data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDeleteUser(profile.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
