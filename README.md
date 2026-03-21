# Media Portal — Admin Panel

**Base URL:** `https://media-portal-server.onrender.com/api`

Auth token is stored in `localStorage` as `token` and sent via `Authorization: Bearer <token>` header on every request (handled automatically by `useAxios`).

---

## 🔐 Auth Routes

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| `POST` | `/auth/admin/login` | `{ email, password }` | Admin login — returns `{ token, user }` |
| `POST` | `/auth/admin/register` | `{ name, email, password, role }` | Register first admin (no token required) |
| `POST` | `/auth/forgot-password` | `{ email }` | Send password reset link to email |
| `POST` | `/auth/reset-password` | `{ token, password }` | Reset password using token from email |

---

## 👤 User Management Routes

> All routes require `Authorization: Bearer <token>`

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| `GET` | `/users` | — | Get all users |
| `POST` | `/users` | `{ name, email, password, role, accessiblePages? }` | Create a new user (admin/editor/moderator) |
| `PUT` | `/users/:id` | `{ name, email, password?, role, accessiblePages? }` | Update a user by ID |
| `DELETE` | `/users/:id` | — | Delete a user by ID |

**Roles:** `admin`, `editor`, `moderator`

**`accessiblePages`** (moderator only): array of route strings, e.g. `["/dashboard", "/posts"]`

---

## 🏫 Events / Schools Routes

> All routes require `Authorization: Bearer <token>`

### Schools

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/events/schools` | — | Get all schools — returns `{ data: [...] }` |
| `POST` | `/events/schools` | `{ name }` | Create a new school |
| `PUT` | `/events/schools/:id` | `{ name }` | Rename a school |
| `DELETE` | `/events/schools/:id` | — | Delete a school (cascades events & classes) |
| `GET` | `/events/schools/:id/export` | — | Export full school data as JSON |

### Events (within a School)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/events/schools/:schoolId/events` | — | Get all events for a school — returns `{ data: [...] }` |
| `POST` | `/events/schools/:schoolId/events` | `{ name }` | Create a new event in a school |
| `PUT` | `/events/events/:id` | `{ name }` | Rename an event |
| `DELETE` | `/events/events/:id` | — | Delete an event |

### Classes (within an Event)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/events/events/:eventId/classes` | — | Get all classes for an event — returns `{ data: [...] }` |
| `POST` | `/events/events/:eventId/classes` | `{ name }` | Create a new class in an event |
| `PUT` | `/events/classes/:id` | `{ name }` | Rename a class |
| `DELETE` | `/events/classes/:id` | — | Delete a class |

### Students (within a Class)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/events/classes/:classId/students` | — | Get all students in a class — returns `{ data: [...] }` |
| `POST` | `/events/classes/:classId/students` | `{ studentId, firstName, lastName, parentEmail? }` | Add a single student to a class |
| `PUT` | `/events/students/:id` | `{ studentId, firstName, lastName, parentEmail? }` | Update a student |
| `DELETE` | `/events/students/:id` | — | Delete a student |

---

## 📤 Bulk Upload Routes

> All routes require `Authorization: Bearer <token>` and use `multipart/form-data`

| Method | Endpoint | Form Field | Description |
|--------|----------|------------|-------------|
| `POST` | `/events/events/:eventId/upload-classes-students` | `file` (CSV) | Bulk import classes & students into an event |
| `POST` | `/events/classes/:classId/upload-students` | `file` (CSV) | Bulk import students into a class via CSV |
| `POST` | `/events/classes/:classId/upload-images` | `images` (multiple image files) | Upload student photos (matched by filename = studentId) |

### CSV Formats

**Bulk import (classes + students):**
```
className,studentId,firstName,lastName,parentEmail
Grade 3A,S001,Alice,Johnson,alice.parent@email.com
Grade 3B,S003,Carol,White,carol.parent@email.com
```

**Students CSV (per class):**
```
studentId,firstName,lastName,parentEmail
S001,Alice,Johnson,alice.parent@email.com
S002,Bob,Smith,
```

### Image Upload Convention
Name each image file with the student ID (e.g. `1001.jpg`, `S002.png`). The server will match by filename → studentId automatically. Unmatched files are returned in `unmatchedFiles[]`.

**Upload Images Response:**
```json
{
  "success": true,
  "data": {
    "totalUploaded": 10,
    "matched": 8,
    "unmatched": 2,
    "matchedStudents": [{ "name": "Alice Johnson", "studentId": "S001", "imageUrl": "..." }],
    "unmatchedFiles": ["unknown.jpg"]
  }
}
```

---

## 🔑 Auth Flow Summary

```
1. POST /auth/admin/login  → get token
2. Store token in localStorage
3. useAxios auto-attaches: Authorization: Bearer <token>
4. All /users and /events/* routes are protected
```

---

## 🗂 Frontend Pages → API Mapping

| Page | Route | APIs Used |
|------|-------|-----------|
| Login | `/` | `POST /auth/admin/login` |
| Forgot Password | `/forgot-password` | `POST /auth/forgot-password` |
| Reset Password | `/reset-password/[token]` | `POST /auth/reset-password` |
| User Management | `/dashboard/register` | `GET /users`, `POST /users`, `PUT /users/:id`, `DELETE /users/:id` |
| Events / Schools | `/dashboard/events` | All `/events/*` routes |
| Upload Photos | `/dashboard/events/upload` | `GET /events/schools`, `GET /events/schools/:id/events`, `GET /events/events/:id/classes`, `POST /events/classes/:id/upload-images` |
