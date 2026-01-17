import React, { useState, useEffect } from "react";
import { Announcement, Batch, User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const priorities = ["Low", "Medium", "High", "Urgent"];
const categories = ["General", "Assessment", "Timetable", "Event", "Holiday", "Other"];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [user, setUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    recipient_type: "All",
    batch_id: "",
    priority: "Medium",
    category: "General"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [currentUser, announcementData, batchData] = await Promise.all([
        User.me(),
        Announcement.list("-created_date", 100),
        Batch.list()
      ]);
      setUser(currentUser);
      setAnnouncements(announcementData);
      setBatches(batchData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await Announcement.create({
        ...formData,
        sender_name: user.full_name,
        sender_email: user.email,
        announcement_date: new Date().toISOString()
      });
      setMessage({ type: "success", text: "Announcement sent successfully!" });
      await loadData();
      resetForm();
      setShowAddModal(false);
    } catch (error) {
      console.error("Error sending announcement:", error);
      setMessage({ type: "error", text: "Failed to send announcement" });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      recipient_type: "All",
      batch_id: "",
      priority: "Medium",
      category: "General"
    });
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "Urgent": return "bg-red-100 text-red-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case "Assessment": return "bg-purple-100 text-purple-800";
      case "Timetable": return "bg-green-100 text-green-800";
      case "Event": return "bg-pink-100 text-pink-800";
      case "Holiday": return "bg-cyan-100 text-cyan-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-20 -left-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/50 shadow-2xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <Megaphone className="w-8 h-8 text-blue-600" />
                Announcements
              </h1>
              <p className="text-gray-700">Broadcast messages to students and faculty</p>
            </div>
            {user && user.role === "admin" && (
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg gap-2">
                  <Plus className="w-4 h-4" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Title *</Label>
                    <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Message *</Label>
                    <Textarea rows={5} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Recipient Type *</Label>
                      <Select value={formData.recipient_type} onValueChange={(value) => setFormData({...formData, recipient_type: value, batch_id: ""})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Students</SelectItem>
                          <SelectItem value="Batch">Specific Batch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.recipient_type === "Batch" && (
                      <div>
                        <Label>Batch *</Label>
                        <Select value={formData.batch_id} onValueChange={(value) => setFormData({...formData, batch_id: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {batches.map(batch => (
                              <SelectItem key={batch.id} value={batch.id}>
                                {batch.college_name} - {batch.year} {batch.branch} {batch.division}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Priority *</Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map(priority => (
                            <SelectItem key={priority} value={priority}>
                              {priority}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Send Announcement
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            )}
   