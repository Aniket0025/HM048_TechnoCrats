import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Star, Send, CheckCircle2, Lock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressRing } from '@/components/ui/progress-ring';

interface FeedbackSubject {
  id: string;
  subject: string;
  teacher: string;
  submitted: boolean;
  deadline: string;
}

const mockSubjects: FeedbackSubject[] = [
  { id: '1', subject: 'Data Structures', teacher: 'Dr. Emily Williams', submitted: true, deadline: '2024-01-20' },
  { id: '2', subject: 'Database Systems', teacher: 'Prof. James Brown', submitted: false, deadline: '2024-01-22' },
  { id: '3', subject: 'Computer Networks', teacher: 'Dr. Sarah Johnson', submitted: false, deadline: '2024-01-25' },
  { id: '4', subject: 'Software Engineering', teacher: 'Prof. Michael Chen', submitted: true, deadline: '2024-01-18' },
];

const feedbackQuestions = [
  { id: 1, question: 'How would you rate the clarity of explanations?', category: 'Teaching Quality' },
  { id: 2, question: 'How well does the instructor manage class time?', category: 'Time Management' },
  { id: 3, question: 'How approachable is the instructor for doubts?', category: 'Accessibility' },
  { id: 4, question: 'How relevant are the course materials?', category: 'Course Content' },
  { id: 5, question: 'Overall satisfaction with the course?', category: 'Overall' },
];

const teacherFeedbackStats = {
  averageRating: 4.2,
  totalResponses: 156,
  categories: [
    { name: 'Teaching Quality', score: 4.5 },
    { name: 'Time Management', score: 4.0 },
    { name: 'Accessibility', score: 4.3 },
    { name: 'Course Content', score: 4.1 },
    { name: 'Overall', score: 4.2 },
  ],
};

export default function FeedbackPage() {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<FeedbackSubject | null>(null);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (questionId: number, rating: number) => {
    setRatings((prev) => ({ ...prev, [questionId]: rating }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedSubject(null);
      setRatings({});
      setComment('');
    }, 2000);
  };

  // Teacher View - View Aggregated Feedback
  if (user?.role === 'teacher') {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Feedback Analytics"
          description="View aggregated anonymous feedback from students"
          icon={MessageSquare}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Overall Rating */}
          <motion.div
            className="glass-card p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ProgressRing
              progress={teacherFeedbackStats.averageRating * 20}
              size={140}
              color="accent"
            />
            <h3 className="mt-4 text-3xl font-bold font-display">{teacherFeedbackStats.averageRating}</h3>
            <p className="text-muted-foreground">Average Rating</p>
            <p className="text-sm text-muted-foreground mt-2">
              Based on {teacherFeedbackStats.totalResponses} responses
            </p>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            className="lg:col-span-2 glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold font-display mb-4">Category Ratings</h3>
            <div className="space-y-4">
              {teacherFeedbackStats.categories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(category.score)
                                ? 'text-warning fill-warning'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{category.score}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-hero"
                      initial={{ width: 0 }}
                      animate={{ width: `${category.score * 20}%` }}
                      transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Anonymous Note */}
        <motion.div
          className="rounded-xl border border-border bg-muted/30 p-4 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Lock className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            All feedback is anonymous. You can only view aggregated statistics, not individual responses.
          </p>
        </motion.div>
      </div>
    );
  }

  // Student View - Submit Feedback
  return (
    <div className="space-y-8">
      <PageHeader
        title="Course Feedback"
        description="Submit anonymous feedback for your courses"
        icon={MessageSquare}
      />

      {!selectedSubject ? (
        <motion.div
          className="grid gap-4 sm:grid-cols-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {mockSubjects.map((subject, index) => (
            <motion.div
              key={subject.id}
              className={`glass-card p-5 cursor-pointer transition-all ${
                subject.submitted
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:border-primary/30 hover:shadow-md'
              }`}
              onClick={() => !subject.submitted && setSelectedSubject(subject)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!subject.submitted ? { y: -2 } : {}}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{subject.subject}</h3>
                  <p className="text-sm text-muted-foreground">{subject.teacher}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Deadline: {subject.deadline}
                  </p>
                </div>
                {subject.submitted ? (
                  <span className="badge-success">
                    <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                    Submitted
                  </span>
                ) : (
                  <span className="badge-warning">Pending</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="max-w-2xl mx-auto glass-card p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {submitted ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle2 className="h-16 w-16 mx-auto text-success" />
              <h3 className="mt-4 text-xl font-semibold">Thank You!</h3>
              <p className="text-muted-foreground">Your feedback has been submitted anonymously.</p>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-semibold font-display">{selectedSubject.subject}</h3>
                <p className="text-muted-foreground">{selectedSubject.teacher}</p>
              </div>

              <div className="space-y-6">
                {feedbackQuestions.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <label className="text-sm font-medium">
                      <span className="text-xs text-muted-foreground mr-2">{q.category}</span>
                      {q.question}
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <motion.button
                          key={rating}
                          onClick={() => handleRating(q.id, rating)}
                          className={`flex-1 h-12 rounded-lg border transition-all ${
                            ratings[q.id] === rating
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Star
                            className={`h-5 w-5 mx-auto ${
                              ratings[q.id] >= rating
                                ? 'text-warning fill-warning'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}

                <div>
                  <label className="form-label">Additional Comments (Optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="form-input min-h-[100px] resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Your feedback is completely anonymous</span>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSubject(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-hero hover:opacity-90"
                    disabled={Object.keys(ratings).length < feedbackQuestions.length}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </Button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
