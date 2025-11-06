import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User, Mail, Shield, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  is_active: boolean;
  date_joined: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    role: 'customer' as 'admin' | 'customer',
    password: '',
    is_active: true
  });

  const { token } = useAuth();
  const { toast } = useToast();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.results || data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingUser 
        ? `${API_BASE}/users/${editingUser.id}/`
        : `${API_BASE}/auth/register/`;
      
      const method = editingUser ? 'PUT' : 'POST';
      const payload = editingUser 
        ? { ...formData, password: formData.password || undefined }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: editingUser ? 'User Updated' : 'User Created',
          description: `User ${formData.name || formData.username} has been ${editingUser ? 'updated' : 'created'} successfully.`
        });
        
        setIsDialogOpen(false);
        setEditingUser(null);
        setFormData({
          username: '',
          email: '',
          name: '',
          role: 'customer',
          password: '',
          is_active: true
        });
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to save user',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error occurred',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      password: '',
      is_active: user.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`${API_BASE}/users/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: 'User Deleted',
          description: 'User has been deleted successfully.'
        });
        fetchUsers();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete user',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error occurred',
        variant: 'destructive'
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">User Management</h1>
          <p className="text-muted-foreground">Manage customer and admin accounts</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingUser(null);
              setFormData({
                username: '',
                email: '',
                name: '',
                role: 'customer',
                password: '',
                is_active: true
              });
            }}>
              <Plus size={16} className="mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value: 'admin' | 'customer') => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  required={!editingUser}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search size={16} className="text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name ? user.name.substring(0, 2).toUpperCase() : user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{user.name || user.username}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Mail size={14} />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User size={14} />
                        <span>{user.username}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{new Date(user.date_joined).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    <Shield size={12} className="mr-1" />
                    {user.role}
                  </Badge>
                  <Badge variant={user.is_active ? 'default' : 'destructive'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <User size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'No users match your search criteria.' : 'No users have been created yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;