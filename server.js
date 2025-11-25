import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session (for admin)
app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24*60*60*1000 }
}));

// Serve admin static files
app.use('/admin/static', express.static(path.join(__dirname, 'public')));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || '';
let usingMongo = false;

async function connectDB(){
  if(!MONGO_URI){
    console.warn('MONGO_URI not set — running in in-memory fallback mode.');
    return;
  }
  try{
    await mongoose.connect(MONGO_URI, { dbName: 'phonly' });
    usingMongo = true;
    console.log('Connected to MongoDB');
  }catch(err){
    console.error('MongoDB connection error:', err.message);
  }
}
connectDB();

// Define schemas
const bookingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  device: String,
  service: String,
  address: String,
  datetime: String,
  createdAt: { type: Date, default: Date.now }
});
const reviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

let Booking, Review;
if(usingMongo){
  Booking = mongoose.model('Booking', bookingSchema);
  Review = mongoose.model('Review', reviewSchema);
} else {
  // in-memory fallback
  Booking = null;
  Review = null;
}

const memory = {
  bookings: [],
  reviews: [
    { id: Date.now()-2000, name: 'Amit', rating:5, text:'Quick service & genuine parts.'},
    { id: Date.now()-1000, name: 'Priya', rating:5, text:'Fixed my screen same day.'}
  ]
};

// Helper: auth middleware
function ensureAdmin(req,res,next){
  if(req.session && req.session.admin === true) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// ------------------ API ------------------

// health
app.get('/', (req,res)=> res.send('Phonly backend up'));

// POST booking
app.post('/api/book', async (req,res)=>{
  const payload = req.body;
  if(Booking){
    try{
      const b = await Booking.create(payload);
      return res.json({ success:true, booking: b });
    }catch(e){
      console.error(e);
      return res.status(500).json({ success:false });
    }
  } else {
    const b = { id: Date.now(), ...payload, createdAt: new Date() };
    memory.bookings.unshift(b);
    return res.json({ success:true, booking: b });
  }
});

// GET bookings (admin)
app.get('/api/bookings', ensureAdmin, async (req,res)=>{
  if(Booking){
    const list = await Booking.find().sort({ createdAt: -1 }).limit(200).lean();
    return res.json(list);
  } else {
    return res.json(memory.bookings);
  }
});

// delete booking (admin)
app.delete('/api/bookings/:id', ensureAdmin, async (req,res)=>{
  const id = req.params.id;
  if(Booking){
    try{
      await Booking.deleteOne({ _id: id });
      return res.json({ success:true });
    }catch(e){
      return res.status(500).json({ success:false });
    }
  } else {
    memory.bookings = memory.bookings.filter(b => String(b.id) !== String(id));
    return res.json({ success:true });
  }
});

// reviews
app.get('/api/reviews', async (req,res)=>{
  if(Review){
    const list = await Review.find().sort({ createdAt: -1 }).limit(200).lean();
    return res.json(list);
  } else {
    return res.json(memory.reviews);
  }
});
app.post('/api/review', async (req,res)=>{
  const payload = req.body;
  if(Review){
    try{
      const r = await Review.create(payload);
      return res.json({ success:true, review: r });
    }catch(e){
      console.error(e);
      return res.status(500).json({ success:false });
    }
  } else {
    const r = { id: Date.now(), ...payload, createdAt: new Date() };
    memory.reviews.unshift(r);
    return res.json({ success:true, review: r });
  }
});

// ------------------ Admin auth ------------------
// POST login
app.post('/admin/login', (req,res)=>{
  const { email, password } = req.body;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@phonly.com';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'password';

  if(email === ADMIN_EMAIL && password === ADMIN_PASS){
    req.session.admin = true;
    return res.json({ success:true });
  } else {
    return res.status(401).json({ success:false, error: 'Invalid credentials' });
  }
});

// GET logout
app.get('/admin/logout', (req,res)=>{
  req.session.destroy(()=>{ res.json({ success:true }); });
});

// serve admin UI
app.get('/admin', ensureAdmin, (req,res)=>{
  res.sendFile(path.join(__dirname,'public','admin.html'));
});

// admin API - counts for dashboard
app.get('/admin/stats', ensureAdmin, async (req,res)=>{
  let bookingsList = [];
  if(Booking){
    bookingsList = await Booking.find().lean();
  } else {
    bookingsList = memory.bookings;
  }
  // simple stats
  const totalBookings = bookingsList.length;
  const byService = {};
  bookingsList.forEach(b => {
    const s = b.service || 'Unknown';
    byService[s] = (byService[s]||0) + 1;
  });
  res.json({ totalBookings, byService });
});

// Serve other admin static files
app.get('/admin/static/*', (req,res)=>{
  res.sendFile(path.join(__dirname, 'public', req.params[0]));
});

// start
const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log('Server started on', PORT));
