import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { 
  User, 
  Bell, 
  Shield, 
  MapPin, 
  Droplet,
  Mail,
  Phone,
  Edit,
  Trash2,
  UserPlus,
  CheckCircle
} from 'lucide-react';
import { userApi } from '../../lib/api';
import { toast } from 'sonner';

interface UserData {
  id: number;
  username: string;
  email?: string;
  role: string;
  status: string;
  created_at_ms?: number;
  last_login_ms?: number;
}

interface NewUserForm {
  username: string;
  email: string;
  password: string;
  role: string;
}

interface EditUserForm {
  status: string;
  role: string;
}

export function Settings() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  
  const [newUserForm, setNewUserForm] = useState<NewUserForm>({
    username: '',
    email: '',
    password: '',
    role: 'operator',
  });
  
  const [editUserForm, setEditUserForm] = useState<EditUserForm>({
    status: 'active',
    role: 'operator',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.list();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!newUserForm.username || !newUserForm.password) {
      toast.error('Username and password are required');
      return;
    }

    try {
      await userApi.create({
        username: newUserForm.username,
        email: newUserForm.email || undefined,
        password: newUserForm.password,
        role: newUserForm.role,
      });
      toast.success('User created successfully');
      setShowAddDialog(false);
      setNewUserForm({ username: '', email: '', password: '', role: 'operator' });
      await fetchUsers();
    } catch (error) {
      toast.error('Failed to create user: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      await userApi.update(selectedUser.id, {
        status: editUserForm.status,
        role: editUserForm.role,
      });
      toast.success('User updated successfully');
      setShowEditDialog(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (error) {
      toast.error('Failed to update user: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await userApi.delete(selectedUser.id);
      toast.success('User deleted successfully');
      setShowDeleteDialog(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const openEditDialog = (user: UserData) => {
    setSelectedUser(user);
    setEditUserForm({
      status: user.status,
      role: user.role,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (user: UserData) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const formatDateTime = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  const notificationSettings = [
    { id: 1, label: 'Vehicle Over-speeding', enabled: true },
    { id: 2, label: 'Unauthorized Stops', enabled: true },
    { id: 3, label: 'Low Fuel Alerts', enabled: true },
    { id: 4, label: 'Maintenance Reminders', enabled: true },
    { id: 5, label: 'Trip Delays', enabled: true },
    { id: 6, label: 'Customer Complaints', enabled: true },
    { id: 7, label: 'Driver Performance Issues', enabled: false },
    { id: 8, label: 'Daily Summary Reports', enabled: true },
  ];

  const telematicsConfig = [
    { id: 1, parameter: 'Over-speed Threshold', value: '80 km/h', unit: 'km/h' },
    { id: 2, parameter: 'Idle Time Alert', value: '15 min', unit: 'minutes' },
    { id: 3, parameter: 'Harsh Braking Threshold', value: '8 m/s²', unit: 'm/s²' },
    { id: 4, parameter: 'Route Deviation Alert', value: '2 km', unit: 'km' },
    { id: 5, parameter: 'Low Fuel Warning', value: '20%', unit: 'percentage' },
  ];