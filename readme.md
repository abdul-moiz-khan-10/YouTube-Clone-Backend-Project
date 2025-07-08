# Video Platform Backend

## Overview

This is a **production-ready backend API** for a modern video-sharing platform, inspired by YouTube.  
It is built with **Node.js**, **Express**, and **MongoDB**, and provides secure, scalable REST APIs for user management, video uploads, comments, likes, playlists, subscriptions, tweets, analytics, and more.

---

## ✨ Key Features

- **User Authentication:** Secure registration, login, logout, JWT-based authentication, and refresh tokens.
- **Video Management:** Upload, update, delete, publish/unpublish videos with Cloudinary integration for media storage.
- **Comment System:** Add, update, delete, and fetch comments with likes and ownership checks.
- **Like System:** Like/unlike videos, comments, and tweets, with real-time like counts.
- **Playlists:** Create, update, delete, and manage video playlists for personalized content curation.
- **Subscriptions:** Subscribe/unsubscribe to channels, fetch subscriber counts, and manage notifications for new content.
- **Tweets/Shorts:** Post, update, delete, and fetch short-form content (tweets) for increased engagement.
- **Channel Analytics:** Dashboard endpoints for channel stats, video analytics, and engagement metrics.
- **File Uploads:** Secure handling of avatars, cover images, and video files using Multer and Cloudinary.
- **Advanced Aggregation:** Efficient data retrieval with MongoDB aggregation pipelines for search, filtering, sorting, and analytics.
- **Ownership & Security:** Middleware to ensure only resource owners can modify or delete content.
- **Pagination & Search:** Robust support for paginated, searchable, and sortable video/comment lists.
- **Consistent API Responses:** Standardized success and error handling for easy frontend integration.

---

## 🛠️ Tech Stack

- **Node.js** & **Express** – Fast, scalable server-side framework
- **MongoDB** & **Mongoose** – Flexible, performant NoSQL database
- **JWT** – Secure authentication and authorization
- **Cloudinary** – Cloud media storage for images and videos
- **Multer** – File upload middleware

---

## 📁 Project Structure

```
src/
  controllers/    # Business logic for users, videos, comments, likes, playlists, subscriptions, tweets, dashboard
  middlewares/    # Auth, file upload, error handling, ownership checks
  models/         # Mongoose schemas for MongoDB collections
  routes/         # API endpoints for each resource
  utils/          # Helper functions (Cloudinary, ApiResponse, etc.)
.env.example      # Example environment variables
README.md         # Project documentation
```

---

## 🛣️ Main API Endpoints

### User
- `POST /api/v1/users/register` – Register a new user (with avatar/cover image)
- `POST /api/v1/users/login` – Login with username/email and password
- `POST /api/v1/users/logout` – Logout and clear tokens
- `POST /api/v1/users/refresh-token` – Refresh JWT token
- `POST /api/v1/users/change-password` – Change current password
- `GET /api/v1/users/current-user` – Get current user profile
- `PATCH /api/v1/users/update-account` – Update fullname/email
- `PATCH /api/v1/users/avatar` – Update avatar
- `PATCH /api/v1/users/cover-image` – Update cover image
- `GET /api/v1/users/c/:username` – Get channel profile by username
- `GET /api/v1/users/history` – Get watch history

### Video
- `GET /api/v1/videos` – List/search/filter/sort/paginate videos
- `POST /api/v1/videos` – Upload a new video (with thumbnail)
- `GET /api/v1/videos/:videoId` – Get video details by ID
- `PATCH /api/v1/videos/:videoId` – Update video (owner only)
- `DELETE /api/v1/videos/:videoId` – Delete video (owner only)
- `PATCH /api/v1/videos/toggle/publish/:videoId` – Publish/unpublish video (owner only)

### Comment
- `GET /api/v1/comments/:videoId` – Get comments for a video (with pagination, likes, owner info)
- `POST /api/v1/comments/:videoId` – Add a comment to a video
- `PATCH /api/v1/comments/c/:commentId` – Update comment (owner only)
- `DELETE /api/v1/comments/c/:commentId` – Delete comment (owner only)

### Like
- `POST /api/v1/likes/toggle/v/:videoId` – Like/unlike a video
- `POST /api/v1/likes/toggle/c/:commentId` – Like/unlike a comment
- `POST /api/v1/likes/toggle/t/:tweetId` – Like/unlike a tweet
- `GET /api/v1/likes/videos` – Get all liked videos for the user

### Playlist
- `POST /api/v1/playlists` – Create a new playlist
- `GET /api/v1/playlists/:playlistId` – Get playlist details
- `PATCH /api/v1/playlists/:playlistId` – Update playlist (owner only)
- `DELETE /api/v1/playlists/:playlistId` – Delete playlist (owner only)
- `PATCH /api/v1/playlists/add/:videoId/:playlistId` – Add video to playlist (owner only)
- `PATCH /api/v1/playlists/remove/:videoId/:playlistId` – Remove video from playlist (owner only)
- `GET /api/v1/playlists/user/:userId` – Get all playlists for a user

### Subscription
- `GET /api/v1/subscriptions/c/:channelId` – Get all channels a user is subscribed to
- `POST /api/v1/subscriptions/c/:channelId` – Subscribe/unsubscribe to a channel
- `GET /api/v1/subscriptions/u/:subscriberId` – Get all subscribers for a channel

### Tweet (Shorts)
- `POST /api/v1/tweets` – Create a tweet/short
- `GET /api/v1/tweets/user/:userId` – Get all tweets for a user
- `PATCH /api/v1/tweets/:tweetId` – Update tweet (owner only)
- `DELETE /api/v1/tweets/:tweetId` – Delete tweet (owner only)

### Dashboard
- `GET /api/v1/dashboard/stats` – Get channel stats (total videos, subscribers, views, likes)
- `GET /api/v1/dashboard/videos` – Get channel videos with analytics

### Healthcheck
- `GET /api/v1/healthcheck` – Check API/server health
---
## 🔒 Security & Best Practices

- **JWT Authentication** for all protected routes
- **Ownership Middleware** to restrict update/delete to resource owners
- **Input Validation** and error handling in all controllers
- **Password Hashing** for user credentials
- **File Upload Security** with Multer and Cloudinary
- **Environment Variables** for all secrets and credentials
- **Rate Limiting, Helmet, CORS** (recommended for production)

---

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in your MongoDB URI, JWT secrets, Cloudinary credentials, etc.

4. **Run the server:**
   ```bash
   npm run dev
   ```

5. **Test the API:**
   - Use Postman, Swagger UI, or any API client to test endpoints.

---

## 📄 Why Choose This Project?

- **Production-Ready:** Follows best practices for security, scalability, and maintainability.
- **Feature-Rich:** Covers all core features needed for a modern video-sharing platform, including likes, playlists, subscriptions, and tweets/shorts.
- **Clean Code:** Modular structure, clear separation of concerns, and detailed comments.
- **Easy to Extend:** Add new features (e.g., notifications, recommendations) by following the existing structure.
- **Professional Documentation:** Makes onboarding and collaboration easy for any developer or client.

---

## 🤝 Contributing

Pull requests and issues are welcome!  
For bugs, suggestions, or feature requests, please open an issue.

---

## 📬 Contact

For questions or support, open an issue or contact the maintainer.

---
