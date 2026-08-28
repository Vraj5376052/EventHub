# EventHub

An event ticket booking system built for IFN636 Assessment 1.

Small event organisers (uni clubs, local venues) usually sell tickets with a Facebook post and a spreadsheet, which means nobody has an authoritative count of remaining seats and events get oversold. EventHub makes the system hold the seat count and enforces the limit at the moment of booking, so overselling can't happen rather than just being discouraged.

**Live:** http://13.238.116.90

---

## Roles

Two roles, chosen at sign up and enforced on the server.

| | Customer | Organiser |
|---|---|---|
| Register and log in | Yes | Yes |
| Browse published events | Yes | Yes, read only |
| Book tickets | Yes | No, gets 403 |
| Create an event | No, gets 403 | Yes |
| View own events | No | Yes, own only |

The interface hides the options you can't use, but that's just tidiness. The real check is `requireRole` on the server, so calling the API directly still gets refused.

---

## Stack

- React 18 frontend, served as a static build
- Node 22 and Express backend
- MongoDB Atlas
- JWT for auth, bcrypt for passwords
- nginx as a reverse proxy, PM2 to keep the processes running

---

## Running it locally

You'll need Node 20 or later and a MongoDB Atlas connection string.

```bash
git clone https://github.com/Vraj5376052/EventHub.git
cd EventHub
npm run install-all
```

Create `backend/.env`:

```
MONGO_URI=your-atlas-connection-string
JWT_SECRET=any-long-random-string
PORT=5001
```

Then:

```bash
npm start
```

Frontend runs on http://localhost:3000, backend on http://localhost:5001.

Add your own IP to the Atlas network allowlist or the backend won't connect.

---

## Architecture

A request goes through these layers:

```
React page
  sends the request with the login token attached
server.js
  picks the route file for the URL
routes/
  lists the URLs and who is allowed to call them
middleware/authMiddleware.js
  protect      are you logged in?      401 if not
  requireRole  are you allowed?        403 if not
controllers/
  validates the input, then does the work
models/
  the shape of the data in MongoDB
MongoDB Atlas
```

```
backend/
  models/       User.js, Event.js, Booking.js
  controllers/  authController.js, eventController.js, bookingController.js
  routes/       authRoutes.js, eventRoutes.js, bookingRoutes.js
  middleware/   authMiddleware.js
  server.js
frontend/src/
  pages/        Login, Register, BrowseEvents, CreateEvent, MyEvents
  components/   Navbar
  context/      AuthContext
  axiosConfig.jsx
```

### How booking avoids overselling

This is the part worth reading. The obvious way to book a seat is to read the current count, check there's room, then save the new number. That leaves a gap between the check and the save, and two people booking at the same moment both pass the check and both save, which oversells the event.

Instead the check and the increment happen in one database operation:

```js
const event = await Event.findOneAndUpdate(
  { _id: eventId,
    status: 'published',
    $expr: { $lte: [{ $add: ['$bookedSeats', qty] }, '$capacity'] } },
  { $inc: { bookedSeats: qty } },
  { new: true }
);
```

The capacity guard is part of the query rather than a check that runs first. MongoDB applies a single document update completely or not at all, so only one request can take the last seat. If the guard fails nothing matches, `null` comes back, no seats were taken and there's nothing to undo.

Checked with 50 booking requests fired at the same time against a 10 seat event. 10 succeeded, 40 were rejected, and the stored count was 10.

Seats remaining is always worked out as `capacity - bookedSeats`. It's never stored on its own, so the two numbers can't disagree.

---

## Deploying

There's no CI/CD, it's deliberately out of scope for this assessment. This is the manual procedure.

1. Start the EC2 instance and note the public IPv4 address
2. In the security group, allow SSH (22) from your own IP only, and HTTP (80) and Custom TCP (5001) from anywhere
3. On the instance, install nginx, Node 22 via nvm, and PM2
4. Clone the repo
5. Create `backend/.env` directly on the server. It's gitignored and never committed.
6. Add the instance's IP to the MongoDB Atlas network allowlist
7. **Build the frontend on your own machine**, not on the server:
   ```bash
   cd frontend
   REACT_APP_API_URL=http://YOUR-IP:5001 npm run build
   scp -i your-key.pem -r build ubuntu@YOUR-IP:~/EventHub/frontend/
   ```
8. On the server, start both processes and make them survive a reboot:
   ```bash
   cd ~/EventHub/backend && pm2 start server.js --name backend
   cd ~/EventHub/frontend && pm2 serve build 3000 --name frontend --spa
   pm2 save && pm2 startup
   ```
9. Point nginx at port 3000 and restart it
10. Test both workflows from a network other than the one you developed on

**Step 7 matters.** Running `npm run build` on the instance uses 2 to 3 GB and froze the server during deployment. Building locally and copying the folder up avoids it entirely.

### Ports

| Port | Open to | Why |
|---|---|---|
| 22 | Specific IPs | Admin access, shouldn't be public |
| 80 | Anyone | The site has to be reachable |
| 5001 | Anyone | The browser calls the API directly, so this can't be closed |

### If the IP changes

No Elastic IP was available on the shared student account, so the instance has to stay running. If the address does change:

1. Rebuild the frontend with the new `REACT_APP_API_URL`
2. `scp` the build folder up
3. `pm2 restart frontend`
4. Update the Atlas allowlist and the URL in this file

Takes about five minutes.

---

## What isn't built

These are designed and sitting in the backlog, not forgotten. The brief asks for one complete workflow in code, so the effort went into making booking correct rather than half building several features.

| | Why not |
|---|---|
| View my bookings (EH-12) | Deferred, decision DL-06 |
| Cancel a booking (EH-13) | Deferred, decision DL-06 |
| Automated test suite (EH-14) | Dropped, decision DL-08. Concurrency was verified with a script instead. |
| Edit an event (EH-17) | Backlog |
| Publish and unpublish (EH-18) | Backlog |
| Cancel an event (EH-19) | Backlog |
| Attendee list (EH-20) | Backlog |
| Payments | Out of scope. The problem is seat counting, not taking money. |
| Assigned seating, notifications, waitlists, QR check in | Out of scope |

Other known limitations:

- The JWT lasts 30 days, which came from the starter project. 24 hours would be more sensible for something holding personal data.
- The "My Bookings" link shows in the customer navigation but the page isn't built.
- The API is served on port 5001 rather than proxied through nginx. Proxying `/api` would mean only port 80 needs to be open.

---

## Links

| | |
|---|---|
| Live app | http://13.238.116.90 |
| API | http://13.238.116.90:5001 |
| EC2 instance | `i-0c5b45be3f12330e3`, ap-southeast-2 |
| Repo | https://github.com/Vraj5376052/EventHub |

Built by Vraj Patel (n11820349) for IFN636 Software Life Cycle Management, Semester 2 2026.
