import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Plus, Edit, Trash2, Navigation, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";

interface GeoFenceZone {
  _id: string;
  session_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  college_name: string;
  batch_id?: string;
  is_active: boolean;
  created_at: string;
  session?: {
    _id: string;
    session_name: string;
    college_name: string;
  };
  batch?: {
    _id: string;
    batch_name: string;
  };
}

interface Session {
  _id: string;
  session_name: string;
  college_name: string;
}

interface Batch {
  _id: string;
  batch_name: string;
}

interface ValidationResult {
  is_within_fence: boolean;
  distance_meters: number;
  fence_radius: number;
  accuracy_score: number;
  location_name: string;
  college_name: string;
}

export default function GeoFenceManagementPage() {
  const { user } = useAuth();
  const [geoFences, setGeoFences] = useState<GeoFenceZone[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingFence, setEditingFence] = useState<GeoFenceZone | null>(null);
  const [testLocation, setTestLocation] = useState({ latitude: "", longitude: "" });
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [formData, setFormData] = useState({
    session_id: "",
    location_name: "",
    latitude: "",
    longitude: "",
    radius_meters: 50,
    college_name: "",
    batch_id: ""
  });

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('edusync_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const [fencesResponse, sessionsResponse, batchesResponse] = await Promise.all([
        fetch(`${API_BASE}/api/geofence/list`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/sessions/list`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/batches/list`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!fencesResponse.ok || !sessionsResponse.ok || !batchesResponse.ok) {
        throw new Error('Failed to load data');
      }

      const fencesData = await fencesResponse.json();
      const sessionsData = await sessionsResponse.json();
      const batchesData = await batchesResponse.json();

      setGeoFences(fencesData.geoFences || []);
      setSessions(sessionsData.sessions || []);
      setBatches(batchesData.batches || []);
    } catch (error) {
      console.error("Error loading data:", error);
      // Fallback mock data if API fails
      setSessions([
        { _id: "1", session_name: "Morning Session", college_name: "Test College" },
        { _id: "2", session_name: "Evening Session", college_name: "Test College" }
      ]);
      setBatches([
        { _id: "1", batch_name: "Batch A" },
        { _id: "2", batch_name: "Batch B" }
      ]);
    }
    setLoading(false);
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your current location. Please enter coordinates manually.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('edusync_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const data = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius_meters: parseInt(formData.radius_meters.toString())
      };

      const url = editingFence 
        ? `${API_BASE}/api/geofence/${editingFence._id}`
        : `${API_BASE}/api/geofence/create`;
      
      const method = editingFence ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error saving geo-fence');
      }

      setShowAddDialog(false);
      setEditingFence(null);
      setFormData({
        session_id: "",
        location_name: "",
        latitude: "",
        longitude: "",
        radius_meters: 50,
        college_name: "",
        batch_id: ""
      });
      loadData();
    } catch (error) {
      console.error("Error saving geo-fence:", error);
      alert(`Error saving geo-fence: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this geo-fence zone?")) {
      return;
    }

    try {
      const token = localStorage.getItem('edusync_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE}/api/geofence/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Error deleting geo-fence');
      }

      loadData();
    } catch (error) {
      console.error("Error deleting geo-fence:", error);
      alert("Error deleting geo-fence. Please try again.");
    }
  };

  const toggleActive = async (fence: GeoFenceZone) => {
    try {
      const token = localStorage.getItem('edusync_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE}/api/geofence/${fence._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !fence.is_active })
      });

      if (!response.ok) {
        throw new Error('Error toggling geo-fence');
      }

      loadData();
    } catch (error) {
      console.error("Error toggling geo-fence:", error);
      alert("Error toggling geo-fence. Please try again.");
    }
  };

  const validateLocation = async () => {
    if (!testLocation.latitude || !testLocation.longitude) {
      alert("Please enter test location coordinates");
      return;
    }

    setValidating(true);
    try {
      const token = localStorage.getItem('edusync_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE}/api/geofence/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          latitude: parseFloat(testLocation.latitude),
          longitude: parseFloat(testLocation.longitude)
        })
      });

      if (!response.ok) {
        throw new Error('Error validating location');
      }

      const data = await response.json();
      if (data.validation_result && data.validation_result.best_match) {
        setValidationResult(data.validation_result.best_match);
      } else {
        setValidationResult({
          is_within_fence: false,
          distance_meters: 0,
          fence_radius: 0,
          accuracy_score: 0,
          location_name: 'No fence found',
          college_name: ''
        });
      }
    } catch (error) {
      console.error("Error validating location:", error);
      alert("Error validating location. Please try again.");
    }
    setValidating(false);
  };

  const startEdit = (fence: GeoFenceZone) => {
    setEditingFence(fence);
    setFormData({
      session_id: fence.session_id,
      location_name: fence.location_name,
      latitude: fence.latitude.toString(),
      longitude: fence.longitude.toString(),
      radius_meters: fence.radius_meters,
      college_name: fence.college_name,
      batch_id: fence.batch_id || ""
    });
    setShowAddDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading geo-fence zones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Geo-Fence Management"
        description="Configure location-based attendance validation"
        icon={MapPin}
      />

      {/* Location Testing Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Test Location Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Test Latitude</Label>
              <Input
                type="number"
                step="any"
                placeholder="18.5204"
                value={testLocation.latitude}
                onChange={(e) => setTestLocation(prev => ({ ...prev, latitude: e.target.value }))}
              />
            </div>
            <div>
              <Label>Test Longitude</Label>
              <Input
                type="number"
                step="any"
                placeholder="73.8567"
                value={testLocation.longitude}
                onChange={(e) => setTestLocation(prev => ({ ...prev, longitude: e.target.value }))}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button 
                onClick={validateLocation} 
                disabled={validating}
                className="flex-1"
              >
                {validating ? 'Validating...' : 'Validate Location'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        setTestLocation({
                          latitude: position.coords.latitude.toFixed(6),
                          longitude: position.coords.longitude.toFixed(6)
                        });
                      },
                      (error) => {
                        alert("Unable to get your current location");
                      }
                    );
                  }
                }}
              >
                <Navigation className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {validationResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              validationResult.is_within_fence 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {validationResult.is_within_fence ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-semibold">
                  {validationResult.is_within_fence ? 'Within Geo-Fence' : 'Outside All Geo-Fences'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Location: {validationResult.location_name}</p>
                <p>College: {validationResult.college_name}</p>
                <p>Distance: {validationResult.distance_meters}m</p>
                <p>Fence Radius: {validationResult.fence_radius}m</p>
                <p>Accuracy Score: {(validationResult.accuracy_score * 100).toFixed(1)}%</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Geo-Fence Button */}
      <div className="flex justify-between items-center mb-6">
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingFence(null);
              setFormData({
                session_id: "",
                location_name: "",
                latitude: "",
                longitude: "",
                radius_meters: 50,
                college_name: "",
                batch_id: ""
              });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Geo-Fence
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingFence ? 'Edit' : 'Add'} Geo-Fence Zone</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Session</Label>
                <Select 
                  value={formData.session_id} 
                  onValueChange={(val) => setFormData({...formData, session_id: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map(session => (
                      <SelectItem key={session._id} value={session._id}>
                        {session.session_name} - {session.college_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location Name</Label>
                <Input
                  placeholder="e.g., Classroom 101, Lab A"
                  value={formData.location_name}
                  onChange={(e) => setFormData({...formData, location_name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="18.5204"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="73.8567"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    required
                  />
                </div>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={getCurrentLocation} 
                className="w-full"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Use My Current Location
              </Button>
              <div>
                <Label>Radius (meters)</Label>
                <Input
                  type="number"
                  min="10"
                  max="500"
                  value={formData.radius_meters}
                  onChange={(e) => setFormData({...formData, radius_meters: parseInt(e.target.value)})}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Typical: 30-100 meters</p>
              </div>
              <div>
                <Label>College Name</Label>
                <Input
                  placeholder="College Name"
                  value={formData.college_name}
                  onChange={(e) => setFormData({...formData, college_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Batch (Optional)</Label>
                <Select 
                  value={formData.batch_id} 
                  onValueChange={(val) => setFormData({...formData, batch_id: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No batch</SelectItem>
                    {batches.map(batch => (
                      <SelectItem key={batch._id} value={batch._id}>
                        {batch.batch_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingFence ? 'Update' : 'Create'} Geo-Fence
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Geo-Fences List */}
      <div className="grid gap-4">
        {geoFences.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No geo-fence zones configured yet</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Geo-Fence
              </Button>
            </CardContent>
          </Card>
        ) : (
          geoFences.map((fence) => (
            <Card key={fence._id} className={!fence.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{fence.location_name}</h3>
                      <Badge className={fence.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {fence.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Session</p>
                        <p className="font-semibold">{fence.session?.session_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Coordinates</p>
                        <p className="font-mono text-xs">
                          {fence.latitude?.toFixed(4)}, {fence.longitude?.toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Radius</p>
                        <p className="font-semibold">{fence.radius_meters}m</p>
                      </div>
                      <div>
                        <p className="text-gray-500">College</p>
                        <p className="font-semibold">{fence.college_name}</p>
                      </div>
                    </div>
                    {fence.batch && (
                      <div className="mt-2">
                        <p className="text-gray-500 text-sm">Batch</p>
                        <p className="font-semibold text-sm">{fence.batch.batch_name}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => toggleActive(fence)}
                    >
                      {fence.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => startEdit(fence)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(fence._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
