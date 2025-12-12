import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Truck } from 'lucide-react';
import { UserRole } from '../../App';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - owner credentials: owner/owner, supervisor: supervisor/supervisor
    if (username === 'owner' && password === 'owner') {
      onLogin('owner');
    } else if (username === 'supervisor' && password === 'supervisor') {
      onLogin('supervisor');
    } else {
      alert('Invalid credentials. Try:\nOwner: owner/owner\nSupervisor: supervisor/supervisor');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <Card className="w-full max-w-md mx-4 shadow-2xl border-slate-700">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-[#10b981] p-4 rounded-full">
              <Truck className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl">FleetMaster Pro</CardTitle>
          <CardDescription className="text-base">
            Fleet Management & Telematics System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-50"
              />
            </div>
            <Button type="submit" className="w-full bg-[#0f172a] hover:bg-[#1e293b]">
              Sign In
            </Button>
            <div className="text-xs text-center text-slate-500 mt-4 space-y-1">
              <p>Demo Credentials:</p>
              <p>Owner: owner / owner</p>
              <p>Supervisor: supervisor / supervisor</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
