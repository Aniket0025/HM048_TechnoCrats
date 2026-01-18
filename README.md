**[HM048] [Code200]**  
# **EDUTRACK - Education Management & Smart Attendance Platform**  

## **📌 Purpose of the Website**  
EDUTRACK is a full-stack web application built to digitize and simplify institute operations through role-based dashboards, smart attendance (including QR attendance), timetable management, feedback collection, announcements, and analytics.

### **How It Works?**  
- Users sign up and sign in with **role-based access** (Admin, Department, Teacher, Student).
- Teachers can **generate time-bound QR codes** for attendance; students can **scan** to mark attendance.
- Students can view **attendance history**, **weekly timetable**, and submit **course feedback**.
- Admin/Department users can track institute-level insights via **analytics dashboards** and broadcast **announcements/messages**.

### **How It Helps the Institute?**  
- Reduces manual effort by enabling **digital attendance** and consolidated academic tracking.
- Improves coordination using **announcements** and **direct messaging**.
- Helps decision-making with **institution-wide analytics** for attendance and engagement.

---

## **🌟 Features**  

✔ **Multi-Role Authentication** - Secure login with role-based dashboards (Admin/Department/Teacher/Student).  
✔ **Smart Attendance** - View and manage attendance records with subject-wise stats.  
✔ **QR Attendance** - Teacher-generated QR with a validity timer and student scan workflow.  
✔ **Timetable Management** - Weekly schedule view with today’s class highlights.  
✔ **Feedback System** - Student feedback submission and teacher-side aggregated feedback analytics.  
✔ **Analytics Dashboard** - Attendance trends, department breakdowns, feedback distribution & export actions.  
✔ **Announcements** - Broadcast institute notices with category/priority tagging.  
✔ **Messaging** - Direct messaging between faculty and students (inbox/sent + read/unread).  
✔ **Responsive UI** - Modern interface optimized for desktop/tablet/mobile.  

---

## **🖼️ Screenshots**  
Here are some sample screenshots showcasing the platform UI (placeholders):  

**🔹 Landing Page**  
![Landing](https://raw.githubusercontent.com/Aniket0025/HM048_TechnoCrats/main/frontend/public/placeholder.svg)  

**🔹 Dashboard**  
![Dashboard](https://raw.githubusercontent.com/Aniket0025/HM048_TechnoCrats/main/frontend/public/placeholder.svg)  

**🔹 QR Attendance**  
![QR Attendance](https://raw.githubusercontent.com/Aniket0025/HM048_TechnoCrats/main/frontend/public/placeholder.svg)  

**🔹 Attendance & Analytics**  
![Analytics](https://raw.githubusercontent.com/Aniket0025/HM048_TechnoCrats/main/frontend/public/placeholder.svg)  

---

## **🌍 GitHub Repository**  
🔗 **[HM048_TechnoCrats](https://github.com/Aniket0025/HM048_TechnoCrats)**  

---

## **🎥 Demo Video**  
📽️ **[Watch the Demo](https://drive.google.com/file/d/1akmxhVsrN_OLn0QNyfg5VHq6bkaTu3g3/view?usp=sharing)**  

---

## **🛠️ Tech Stack & APIs Used**  

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router  
- **UI/Charts:** Framer Motion, Recharts, Lucide Icons  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Mongoose ODM)  
- **Authentication:** JWT (jsonwebtoken), Password Hashing (bcryptjs), Google Auth
- **Utilities:** dotenv, cors  
- **Avatar API:** DiceBear Avatars API (for user avatar fallback)  

---

## **🚀 Upcoming Features**  

🔹 **Persistent Attendance & Timetable Data:** Replace mock data with fully integrated database-backed modules.  
🔹 **Report Export Enhancements:** PDF/CSV exports for attendance & analytics dashboards.  
🔹 **Notifications:** Real-time alerts for low attendance, announcements, and messages.  
🔹 **More Admin Controls:** College/department/subject management with advanced filters & audit logs.  

---

## **📖 How to Fork/Clone the Project?**  

1. **Fork the Repository** - Click the "Fork" button on GitHub.  
2. **Clone the Repository**  
   ```bash
   git clone https://github.com/Aniket0025/HM048_TechnoCrats.git
   ```

---

## **⚙️ Local Setup**

### **Prerequisites**
- Node.js (recommended: 18+)
- npm

### **1) Backend**
```bash
cd backend
npm i
npm run dev
```

Create `backend/.env` (or update `.env.example`) with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/HackMatrix
JWT_SECRET=change_me_to_a_long_random_string
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:8080
```

### **2) Frontend**
```bash
cd frontend
npm i
npm run dev
```

Optional (frontend API base URL):
```env
VITE_API_URL=http://localhost:5000
```

---

## **📩 Contact Us**
If you have questions or want to report an issue, please open an issue on the GitHub repository:
🔗 https://github.com/Aniket0025/HM048_TechnoCrats/issues

---

## **📜 License**  
License MIT.
