const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { connectDB } = require('./config/db');

// Import Schemas for Seeding
const Event = require('./models/Event');
const Student = require('./models/Student');

// Import Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database client
connectDB().then(() => {
    // Seed initial event database data if empty
    seedDefaultData();
});

// Middleware
app.use(cors({
    origin: true, // Allow request origin
    credentials: true // Allow cookies
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

// Seed Default Events if empty
async function seedDefaultData() {
    try {
        const eventCount = await Event.find({});
        if (eventCount.length === 0) {
            console.log('Seeding initial event dataset into Database...');
            const defaultEvents = [
                {
                    event_name: 'EDM Music Festival',
                    event_date: new Date('2026-04-10'),
                    location: 'Jaipur',
                    description: 'Experience a high-voltage night featuring premium Indian and International electronic dance music artists, visual arts, and gourmet snack zones.',
                    price: 799,
                    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'
                },
                {
                    event_name: 'Street Food Carnival',
                    event_date: new Date('2026-04-15'),
                    location: 'Delhi',
                    description: 'A grand celebration of gourmet experiences presenting iconic culinary treats from street vendors across India alongside acoustic live bands.',
                    price: 299,
                    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
                },
                {
                    event_name: 'AI & Tech Conference',
                    event_date: new Date('2026-04-20'),
                    location: 'Mumbai',
                    description: 'Learn from engineering leaders, network with researchers, and explore demos on modern Generative AI, Cloud Computing, and cyber-security architectures.',
                    price: 999,
                    imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80'
                }
            ];
            
            for (let evt of defaultEvents) {
                await Event.create(evt);
            }
            console.log('Initial event dataset seeded successfully. ✅');
        }

        // Seed some students for instant presentation utility
        const studentCount = await Student.find({});
        if (studentCount.length === 0) {
            console.log('Seeding initial student dataset into Database...');
            const defaultStudents = [
                { name: 'Aarav Sharma', email: 'aarav@gmail.com', age: 21, course: 'Information Technology' },
                { name: 'Nimisha Singh', email: 'nimisha@gmail.com', age: 20, course: 'Computer Science' },
                { name: 'Kabir Verma', email: 'kabir@gmail.com', age: 22, course: 'Software Engineering' }
            ];
            for (let st of defaultStudents) {
                await Student.create(st);
            }
            console.log('Initial student dataset seeded successfully. ✅');
        }

    } catch (err) {
        console.error('Failed seeding default event registry data:', err);
    }
}

// Serve React production build statically in production mode
const distPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(distPath));

app.use((req, res, next) => {
    if (req.method === 'GET' && req.headers.accept && req.headers.accept.includes('text/html')) {
        res.sendFile(path.join(distPath, 'index.html'), (err) => {
            if (err) {
                res.status(200).send('EventConnect API server up and running! React client not compiled yet (run dev server for editing client UI).');
            }
        });
    } else {
        next();
    }
});


// Start Express Listener
app.listen(PORT, () => {
    console.log(`🚀 Server running on port: ${PORT}`);
    console.log(`🚀 Visit server status at: http://localhost:${PORT}`);
});
