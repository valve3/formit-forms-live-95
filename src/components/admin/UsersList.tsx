
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { UserCard } from './UserCard';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface UsersListProps {
  profiles: Profile[];
  onUpdateRole: (userId: string, newRole: string) => void;
  onDeleteUser: (userId: string) => void;
  deletingUserId: string | null;
}

export const UsersList = ({ profiles, onUpdateRole, onDeleteUser, deletingUserId }: UsersListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          All Users ({profiles.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {profiles.map((profile) => (
            <UserCard
              key={profile.id}
              profile={profile}
              onUpdateRole={onUpdateRole}
              onDeleteUser={onDeleteUser}
              deletingUserId={deletingUserId}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
