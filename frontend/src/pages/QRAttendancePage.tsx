import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Scan, CheckCircle2, XCircle, Clock, Smartphone } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface QRSession {
  id: string;
  subject: string;
  teacher: string;
  validUntil: string;
  code: string;
}

const mockQRSession: QRSession = {
  id: '1',
  subject: 'Data Structures',
  teacher: 'Dr. Emily Williams',
  validUntil: '09:15 AM',
  code: 'DS-2024-01-15-0900',
};

export default function QRAttendancePage() {
  const { user } = useAuth();
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [showQR, setShowQR] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (showQR && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showQR, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleScan = async () => {
    setScanStatus('scanning');
    // Simulate QR scan
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setScanStatus('success');
    setTimeout(() => setScanStatus('idle'), 3000);
  };

  const generateQR = () => {
    setShowQR(true);
    setTimeRemaining(300);
  };

  // Teacher View - Generate QR
  if (user?.role === 'teacher') {
    return (
      <div className="space-y-8">
        <PageHeader
          title="QR Attendance"
          description="Generate QR codes for class attendance"
          icon={QrCode}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* QR Generator */}
          <motion.div
            className="glass-card p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold font-display mb-2">Generate Attendance QR</h3>
              <p className="text-muted-foreground mb-6">
                Create a time-bound QR code for your current class
              </p>

              {!showQR ? (
                <motion.div className="space-y-4">
                  <div className="qr-container">
                    <QrCode className="h-32 w-32 mx-auto text-primary/20" />
                    <p className="text-sm text-muted-foreground mt-4">
                      Click below to generate QR code
                    </p>
                  </div>
                  <Button
                    onClick={generateQR}
                    className="w-full h-12 bg-gradient-hero hover:opacity-90"
                  >
                    <QrCode className="h-5 w-5 mr-2" />
                    Generate QR Code
                  </Button>
                </motion.div>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="qr-container relative">
                      <div className="qr-scanner-line" />
                      {/* Simulated QR Code Pattern */}
                      <div className="relative z-10 p-4">
                        <div className="grid grid-cols-8 gap-1 w-48 h-48 mx-auto">
                          {Array.from({ length: 64 }).map((_, i) => (
                            <motion.div
                              key={i}
                              className={`rounded-sm ${Math.random() > 0.5 ? 'bg-foreground' : 'bg-transparent'}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.01 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-warning" />
                      <span className={`font-mono font-bold ${timeRemaining < 60 ? 'text-destructive' : 'text-warning'}`}>
                        {formatTime(timeRemaining)}
                      </span>
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm text-muted-foreground">Session Code</p>
                      <p className="font-mono font-semibold">{mockQRSession.code}</p>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setShowQR(false)}
                      className="w-full"
                    >
                      Cancel Session
                    </Button>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>

          {/* Live Attendance */}
          <motion.div
            className="glass-card p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl font-semibold font-display mb-4">Live Attendance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-success/10">
                <span className="font-medium">Marked Present</span>
                <span className="text-2xl font-bold text-success">24</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <span className="font-medium">Total Enrolled</span>
                <span className="text-2xl font-bold">42</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10">
                <span className="font-medium">Not Marked</span>
                <span className="text-2xl font-bold text-destructive">18</span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">Recent Scans</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {['Alex Thompson', 'Sarah Chen', 'Mike Johnson', 'Emily Brown'].map((name, i) => (
                  <motion.div
                    key={name}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">{name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">Just now</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Student View - Scan QR
  return (
    <div className="space-y-8">
      <PageHeader
        title="QR Attendance"
        description="Scan QR code to mark your attendance"
        icon={Scan}
      />

      <div className="max-w-md mx-auto">
        <motion.div
          className="glass-card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <AnimatePresence mode="wait">
              {scanStatus === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="qr-container">
                    <div className="qr-scanner-line" />
                    <Smartphone className="h-24 w-24 mx-auto text-primary/30" />
                    <p className="text-sm text-muted-foreground mt-4">
                      Point your camera at the QR code
                    </p>
                  </div>

                  <Button
                    onClick={handleScan}
                    className="w-full h-14 text-lg bg-gradient-hero hover:opacity-90"
                  >
                    <Scan className="h-6 w-6 mr-2" />
                    Scan QR Code
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Make sure you're in the classroom when scanning
                  </p>
                </motion.div>
              )}

              {scanStatus === 'scanning' && (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12"
                >
                  <motion.div
                    className="h-24 w-24 mx-auto rounded-full border-4 border-primary border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <p className="mt-6 font-medium">Scanning QR Code...</p>
                </motion.div>
              )}

              {scanStatus === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle2 className="h-24 w-24 mx-auto text-success" />
                  </motion.div>
                  <h3 className="mt-4 text-xl font-semibold text-success">Attendance Marked!</h3>
                  <p className="text-muted-foreground mt-2">
                    {mockQRSession.subject} • {mockQRSession.teacher}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Marked at {new Date().toLocaleTimeString()}
                  </p>
                </motion.div>
              )}

              {scanStatus === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12"
                >
                  <XCircle className="h-24 w-24 mx-auto text-destructive" />
                  <h3 className="mt-4 text-xl font-semibold text-destructive">Scan Failed</h3>
                  <p className="text-muted-foreground mt-2">
                    QR code expired or invalid
                  </p>
                  <Button
                    onClick={() => setScanStatus('idle')}
                    variant="outline"
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Today's Classes */}
        <motion.div
          className="mt-6 glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-semibold font-display mb-4">Today's Attendance Status</h3>
          <div className="space-y-3">
            {[
              { subject: 'Data Structures', time: '09:00 AM', status: 'marked' },
              { subject: 'Database Systems', time: '11:00 AM', status: 'pending' },
              { subject: 'Computer Networks', time: '02:00 PM', status: 'upcoming' },
            ].map((cls) => (
              <div
                key={cls.subject}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium">{cls.subject}</p>
                  <p className="text-xs text-muted-foreground">{cls.time}</p>
                </div>
                <span className={`text-xs font-medium ${
                  cls.status === 'marked' ? 'badge-success' :
                  cls.status === 'pending' ? 'badge-warning' : 'badge-info'
                }`}>
                  {cls.status === 'marked' ? '✓ Present' :
                   cls.status === 'pending' ? '○ Pending' : '◷ Upcoming'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Session, Batch } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Clock } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";

const QR_EXPIRY_SECONDS = 45;

export default function QRAttendancePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [batch, setBatch] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [countdown, setCountdown] = useState(QR_EXPIRY_SECONDS);
  const [isLoading, setIsLoading] = useState(true);

  // Get session_id from query parameters
  const urlParams = new URLSearchParams(location.search);
  const session_id = urlParams.get('session_id');

  const generateQRCodeData = useCallback(() => {
    if (!session || !batch) return;
    
    const timestamp = Date.now();
    const url = new URL(window.location.origin + createPageUrl("QRAttendanceStudent"));
    url.searchParams.append("session_id", session.id);
    url.searchParams.append("timestamp", timestamp);
    
    if (batch.batch_type === 'private') {
      url.searchParams.append("batch_type", "private");
    }
    
    // Use an external API to generate the QR code image
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url.toString())}&size=256x256&bgcolor=ffffff`;
    
    setQrCodeDataUrl(qrApiUrl);
    setCountdown(QR_EXPIRY_SECONDS);
  }, [session, batch]);

  useEffect(() => {
    const loadSessionAndBatch = async () => {
      if (!session_id) {
        console.error("No session_id found in URL parameters");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log("Loading session with ID:", session_id);
        const sessionData = await Session.get(session_id);
        if (sessionData && sessionData.batch_id) {
          setSession(sessionData);
          const batchData = await Batch.filter({ batch_id: sessionData.batch_id });
          if (batchData.length > 0) {
            setBatch(batchData[0]);
          } else {
            setBatch({ batch_type: 'standard' }); // Fallback
          }
        }
      } catch (error) {
        console.error("Error loading session/batch data:", error);
      }
      setIsLoading(false);
    };
    loadSessionAndBatch();
  }, [session_id]);

  useEffect(() => {
    if (session && batch) {
      generateQRCodeData();
      const timer = setInterval(generateQRCodeData, QR_EXPIRY_SECONDS * 1000);
      return () => clearInterval(timer);
    }
  }, [session, batch, generateQRCodeData]);

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdownTimer);
  }, [qrCodeDataUrl]);

  if (!session_id) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-red-600">Error: No Session ID Provided</h2>
        <p className="text-gray-600 mt-2">Please navigate back and try again.</p>
        <Button onClick={() => navigate(createPageUrl("Attendance"))} className="mt-4">
          Back to Attendance
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
        <div className="p-8"><Skeleton className="h-96 w-full" /></div>
    );
  }

  if (!session) {
    return <div className="p-8 text-center text-red-500">Session not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={() => navigate(createPageUrl("Attendance"))}>
            <ArrowLeft />
          </Button>
          <CardTitle className="text-2xl font-bold">Scan for Attendance</CardTitle>
          <p className="text-slate-600">{session.session_name}</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="bg-white p-4 rounded-lg border-4 border-slate-800">
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt="Attendance QR Code" width={256} height={256} />
            ) : (
              <Skeleton className="w-64 h-64" />
            )}
          </div>
          <div className="text-center">
            <p className="flex items-center gap-2 text-lg font-semibold text-red-600">
              <Clock className="w-5 h-5 animate-spin" />
              QR code refreshes in: {countdown}s
            </p>
            <p className="text-xs text-slate-500 mt-1">Point your camera at the QR Code to mark your attendance.</p>
          </div>
          <Button variant="outline" onClick={generateQRCodeData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh QR Manually
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}