import React, { useState, useEffect } from "react";
import { TimeTable, Batch, Faculty, User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Edit, Trash2, Download, Filter } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeSlots = [
  "08:00 AM - 09:00 AM",
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "01:00 PM - 02:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM"
];
const classTypes = ["Lecture", "Lab", "Tutorial", "Practical"];

export default function TimeTablePage() {
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [batches, setBatches] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [message, setMessage] = useState(null);
  const [filterBatch, setFilterBatch] = useState("");
  const [filterDay, setFilterDay] = useState("");
  
  const [formData, setFormData] = useState({
    batch_id: "",
    day_of_week: "Monday",
    time_slot: "",
    subject: "",
    faculty_email: "",
    room_number: "",
    class_type: "Lecture",
    semester: "",
    academic_year: "2025-26"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ttData, batchData, facultyData] = await Promise.all([
        TimeTable.list("-created_date", 500),
        Batch.list(),
        Faculty.list()
      ]);
      setTimetableEntries(ttData);
      setBatches(batchData);
      setFaculties(facultyData);
    } catch (error) {
      console.error("Error loading data:", error);
      setMessage({ type: "error", text: "Failed to load data" });
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedBatch = batches.find(b => b.id === formData.batch_id);
      const selectedFaculty = faculties.find(f => f.email === formData.faculty_email);
      
      if (!selectedBatch || !selectedFaculty) {
        setMessage({ type: "error", text: "Please select valid batch and faculty" });
        return;
      }

      const entryData = {
        ...formData,
        college_name: selectedBatch.college_name,
        year: selectedBatch.year,
        branch: selectedBatch.branch,
        division: selectedBatch.division,
        faculty_name: selectedFaculty.name
      };

      if (editingEntry) {
        await TimeTable.update(editingEntry.id, entryData);
        setMessage({ type: "success", text: "Timetable entry updated successfully" });
      } else {
        await TimeTable.create(entryData);
        setMessage({ type: "success", text: "Timetable entry added successfully" });
      }

      await loadData();
      resetForm();
      setShowAddModal(false);
    } catch (error) {
      console.error("Error saving entry:", error);
      setMessage({ type: "error", text: "Failed to save entry" });
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      batch_id: entry.batch_id,
      day_of_week: entry.day_of_week,
      time_slot: entry.time_slot,
      subject: entry.subject,
      faculty_email: entry.faculty_email,
      room_number: entry.room_number || "",
      class_type: entry.class_type,
      semester: entry.semester || "",
      academic_year: entry.academic_year || "2025-26"
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await TimeTable.delete(id);
      setMessage({ type: "success", text: "Entry deleted successfully" });
      await loadData();
    } catch (error) {
      console.error("Error deleting entry:", error);
      setMessage({ type: "error", text: "Failed to delete entry" });
    }
  };

  const resetForm = () => {
    setFormData({
      batch_id: "",
      day_of_week: "Monday",
      time_slot: "",
      subject: "",
 