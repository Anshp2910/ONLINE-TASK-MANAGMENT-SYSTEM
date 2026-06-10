# MongoDB Connection Setup Guide

## Error Resolution: "At least one key/value pair is required"

This error occurs when the MongoDB connection string is missing query parameters.

### ✅ CORRECT Format

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/taskdb?retryWrites=true&w=majority
```

### ❌ INCORRECT Formats (will fail)

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/taskdb?
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/taskdb
```

## Complete Setup Instructions

### 1. **For Local Development** (`backend/.env`)
```env
MONGO_URI=mongodb://127.0.0.1:27017/taskdb
JWT_SECRET=your-secret-key-here
```

### 2. **For MongoDB Atlas (Cloud)** 
Use this format when setting up in Netlify or any cloud environment:

```env
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/taskdb?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here
```

**Replace these values:**
- `YOUR_USERNAME` - Your MongoDB Atlas username
- `YOUR_PASSWORD` - Your MongoDB Atlas password (URL encode if it contains special characters)
- `cluster0.xxxxx.mongodb.net` - Your cluster's connection string
- `taskdb` - Your database name

### 3. **Required Query Parameters**

Always include these at the end of your MongoDB Atlas URI:
- `?retryWrites=true` - Enables automatic retry on transient failures
- `&w=majority` - Ensures writes are replicated to majority of nodes

You can add more parameters if needed:
```
?retryWrites=true&w=majority&authSource=admin&ssl=true
```

## Where to Configure

### Backend (Local):
File: `backend/.env`

### Netlify Functions (Cloud):
1. Go to Netlify Dashboard
2. Site Settings → Environment
3. Add `MONGO_URI` with the complete connection string including query parameters

### Environment Variables Format
When pasting into forms, ensure you include the ENTIRE URI:
```
mongodb+srv://username:password@cluster.xxxxx.mongodb.net/taskdb?retryWrites=true&w=majority
```

## Special Characters in Password

If your MongoDB password contains special characters (`@`, `#`, `:`, etc.), you must URL-encode them:

- `@` → `%40`
- `#` → `%23`
- `:` → `%3A`
- `?` → `%3F`
- `&` → `%26`

Example: `password@123#abc` becomes `password%40123%23abc`

## Testing Connection

Run this command to test:
```bash
cd backend
npm install
npm start
```

If successful, you'll see: `MongoDB Connected`

## Troubleshooting

| Error | Solution |
|-------|----------|
| "At least one key/value pair is required" | Add `?retryWrites=true&w=majority` to your URI |
| "authentication failed" | Check username/password and ensure user has database access |
| "getaddrinfo ENOTFOUND" | Check cluster URL and network access rules in MongoDB Atlas |
| "MONGO_URI is missing" | Ensure `.env` file exists in `backend/` directory |
