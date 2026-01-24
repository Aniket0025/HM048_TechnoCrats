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
<img width="1900" height="905" alt="image" src="https://github.com/user-attachments/assets/4bbb2131-ab7a-48b3-8fc9-a91e6ca3d611" />


**🔹 Dashboard**  
<img width="1898" height="907" alt="image" src="https://github.com/user-attachments/assets/23283d21-6d56-427e-a4e5-fcb3ccf4ed22" />
  
**🔹 QR Attendance**  
<img width="1901" height="914" alt="image" src="https://github.com/user-attachments/assets/05ae8569-43b5-454b-8088-8e84e523f61f" />

<img width="1899" height="909" alt="image" src="https://github.com/user-attachments/assets/71ba51bf-3e68-4573-95b0-fcb15e38696f" />

**🔹 Batch Management ** 
<img width="1900" height="910" alt="image" src="https://github.com/user-attachments/assets/63925648-6fb7-4a20-9573-9dd979144e0a" />


**🔹 Attendance & Analytics**  
<img width="1902" height="914" alt="image" src="https://github.com/user-attachments/assets/e9b7ff35-c0ec-4382-ba08-2819a9f63e55" />

**🔹 Ai power Time Table Genterator **  
<img width="1905" height="912" alt="image" src="https://github.com/user-attachments/assets/557c922c-7c0e-4cfd-9ec1-426a76f37a75" />

<img width="1901" height="911" alt="image" src="https://github.com/user-attachments/assets/2ef8030d-4c31-47d0-b73c-a56196516290" />


**🔹Performance ** 
<img width="1899" height="912" alt="image" src="https://github.com/user-attachments/assets/fa95c816-ee63-4225-9581-6f68d74c840a" />

**🔹Annoucement **  
<img width="1900" height="904" alt="image" src="https://github.com/user-attachments/assets/d435f470-e537-4b63-891d-7f07bcd2004d" />



  
---

## **🌍 GitHub Repository**  
🔗 **[HM048_TechnoCrats](https://github.com/Aniket0025/HM048_TechnoCrats)**  

---

## **🎥 Demo Video**  
📽️ **[Watch the Demo](https://drive.google.com/file/d/1akmxhVsrN_OLn0QNyfg5VHq6bkaTu3g3/view?usp=sharing)**  

---

## **🛠️ Tech Stack & APIs Used**  

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Google OAuth 2.0 (`google-auth-library`)
- **Real‑time**: Socket.IO
- **Email**: Nodemailer (SMTP)
- **Push Notifications**: Web Push (VAPID)
- **Security**: bcryptjs, role‑based access control
- **ML Integration**: Python subprocess for proxy detection
- **Performance**: Optional request logging middleware
- **Environment**: dotenv, cors

### **Frontend**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **State Management**: React Query (TanStack Query)
- **UI**: TailwindCSS + Radix UI (shadcn/ui)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Real‑time**: Socket.IO client
- **QR Scanning**: html5-qrcode
- **Maps**: Google Maps API (planned)
- **Avatars**: DiceBear API

### **ML Model (Python)**
- **Language**: Python 3.11/3.12
- **Libraries**: numpy, pandas, scikit-learn, joblib
- **Model**: RandomForestClassifier for proxy detection
- **Features**: Time, GPS, IP, device fingerprint
- **Pipeline**: Training, scaling, prediction scripts
- **Fallback**: Heuristic if model unavailable

### **DevOps & Tooling**
- **Package Managers**: npm (frontend/backend), pip (ML)
- **Linting**: ESLint, TypeScript
- **Hot Reload**: nodemon (backend), Vite (frontend)
- **Version Control**: Git  

---

## **🚀 Upcoming Features**  

🔹 **Google Maps Geo‑Fencing**: Visual geo‑fence creation and validation for QR attendance.  
🔹 **Real‑Time Socket.IO Attendance**: Live attendance updates during QR sessions.  
🔹 **Advanced Proxy Detection**: ML‑driven proxy detection with real‑time alerts.  
🔹 **Report Export Enhancements**: PDF/CSV exports for attendance & analytics dashboards.  
🔹 **Notifications**: Real-time alerts for low attendance, announcements, and messages.  
🔹 **More Admin Controls**: College/department/subject management with advanced filters & audit logs.  

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

