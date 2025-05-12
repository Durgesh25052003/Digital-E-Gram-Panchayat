# 🌾 Digital E Gram Panchayat

Welcome to the **Digital E Gram Panchayat Web Application** — an initiative to simplify and digitize citizen services in rural areas through a secure, role-based platform. Built with ❤️ using **React + Firebase**.

---

## 🚀 Project Features

👤 **User (Villager)**
- 📝 Register & Login
- 🔍 Search available services
- 📨 Apply for services
- 📄 Track application status
- 🧑‍💼 View & edit profile

👨‍💼 **Staff**
- 🔐 Login
- 📋 View assigned services
- ✅ Update application status

👑 **Admin**
- 🔐 Login
- ➕ Create/Delete/Update services
- 👀 View all applications
- 👥 Manage staff
- ⚙️ Set application statuses

---

## 🧱 Tech Stack

| Layer      | Technology          |
|------------|---------------------|
| 🌐 Frontend | React, HTML, CSS    |
| 🔥 Backend  | Firebase (Auth, Firestore, Storage) |
| ☁️ Hosting  | Firebase Hosting     |
| 💾 Database | Firestore            |

---

## 🔐 Firebase Rules (Role-based Access)

- **Users**: Can only access & modify their own data.
- **Admins**: Full access to manage services, users, staff, and applications.
- **Staff**: Can update application statuses & view assigned tasks.

---

## 🗂 Folder Structure

