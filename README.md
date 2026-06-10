# Online Task Management System

## Local development

Copy `backend/.env.example` to `backend/.env`, then use a local MongoDB URI:

```env
MONGO_URI=mongodb://127.0.0.1:27017/taskdb
JWT_SECRET=replace-with-a-long-random-secret
```

Run the backend with:

```powershell
npm install
npm start
```

Open the files in `frontend` with a local web server.

## Netlify deployment

The local MongoDB address `127.0.0.1` does not work from Netlify. Create a
MongoDB Atlas database and add these variables in **Netlify > Project
configuration > Environment variables** with the Functions scope:

```text
MONGO_URI=mongodb+srv://...
JWT_SECRET=<a-long-random-production-secret>
```

Make sure the Atlas database user and Network Access rules permit the Netlify
Functions connection. Redeploy the site after changing environment variables.

The repository's `netlify.toml` publishes `frontend`, deploys the serverless
functions from `netlify/functions`, and rewrites `/api/*` requests to those
functions.
