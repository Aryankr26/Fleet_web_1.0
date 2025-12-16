import { useState, useEffect } from 'react';
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
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { vehicleApi } from '../../lib/api';
import { toast } from 'sonner';

interface Vehicle {
  imei: string;
  label?: string;
  last_lat?: number;
  last_lon?: number;
  last_speed?: number;
  last_ignition?: boolean;
  last_fuel?: number;
  last_seen_ms?: number;
}

interface VehicleForm {
  imei: string;
  label: string;
}

interface VehicleManagementProps {
  onVehicleChange?: () => void;
}

export function VehicleManagement({ onVehicleChange }: VehicleManagementProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  const [vehicleForm, setVehicleForm] = useState<VehicleForm>({
    imei: '',
    label: '',
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleApi.list();
      setVehicles(data);
      if (onVehicleChange) {
        onVehicleChange();
      }
    } catch (error) {
      toast.error('Failed to fetch vehicles: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async () => {
    if (!vehicleForm.imei) {
      toast.error('Vehicle IMEI is required');
      return;
    }

    try {
      await vehicleApi.create({
        imei: vehicleForm.imei,
        label: vehicleForm.label || undefined,
      });
      toast.success('Vehicle added successfully');
      setShowAddDialog(false);
      setVehicleForm({ imei: '', label: '' });
      await fetchVehicles();
    } catch (error) {
      toast.error('Failed to add vehicle: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleEditVehicle = async () => {
    if (!selectedVehicle) return;

    try {
      await vehicleApi.update(selectedVehicle.imei, {
        label: vehicleForm.label || undefined,
      });
      toast.success('Vehicle updated successfully');
      setShowEditDialog(false);
      setSelectedVehicle(null);
      setVehicleForm({ imei: '', label: '' });
      await fetchVehicles();
    } catch (error) {
      toast.error('Failed to update vehicle: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return;

    try {
      await vehicleApi.delete(selectedVehicle.imei);
      toast.success('Vehicle deleted successfully');
      setShowDeleteDialog(false);
      setSelectedVehicle(null);
      await fetchVehicles();
    } catch (error) {
      toast.error('Failed to delete vehicle: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleForm({
      imei: vehicle.imei,
      label: vehicle.label || '',
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDeleteDialog(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Vehicle Management</h2>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-[#0f172a] hover:bg-[#1e293b]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-600">Loading vehicles...</div>
        ) : (
          <div className="space-y-3">
            {vehicles.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No vehicles found. Add your first vehicle to get started.
              </div>
            ) : (
              vehicles.map((vehicle) => (
                <div
                  key={vehicle.imei}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{vehicle.imei}</p>
                    {vehicle.label && (
                      <p className="text-sm text-slate-600">{vehicle.label}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(vehicle)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => openDeleteDialog(vehicle)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription>
              Add a new vehicle to your fleet by providing the IMEI number and an optional label.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-imei">Vehicle IMEI *</Label>
              <Input
                id="add-imei"
                value={vehicleForm.imei}
                onChange={(e) => setVehicleForm({ ...vehicleForm, imei: e.target.value })}
                placeholder="Enter vehicle IMEI"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-label">Vehicle Label (Optional)</Label>
              <Input
                id="add-label"
                value={vehicleForm.label}
                onChange={(e) => setVehicleForm({ ...vehicleForm, label: e.target.value })}
                placeholder="Enter vehicle label or name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVehicle} className="bg-[#0f172a] hover:bg-[#1e293b]">
              Add Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>
              Update the label for vehicle {selectedVehicle?.imei}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-imei">Vehicle IMEI</Label>
              <Input
                id="edit-imei"
                value={vehicleForm.imei}
                disabled
                className="bg-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-label">Vehicle Label</Label>
              <Input
                id="edit-label"
                value={vehicleForm.label}
                onChange={(e) => setVehicleForm({ ...vehicleForm, label: e.target.value })}
                placeholder="Enter vehicle label or name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditVehicle} className="bg-[#0f172a] hover:bg-[#1e293b]">
              Update Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the vehicle with IMEI{' '}
              <strong>{selectedVehicle?.imei}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVehicle}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Vehicle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
