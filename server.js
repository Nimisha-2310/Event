const express = require("express");
const path = require("path");
const db = require("./db");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const { engine } = require("express-handlebars");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // For fetch JSON bodies
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Configure Handlebars (Task 9)
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Book page
app.get("/book", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "book.html"));
});

// ✅ SAVE DATA TO MYSQL (Original)
app.post("/submit", (req, res) => {
  const { name, email, event, tickets } = req.body;

  const sql = "INSERT INTO bookings (name, email, event, tickets) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, email, event, tickets], (err, result) => {
    if (err) {
      console.log(err);
      res.send("Error saving booking ❌");
    } else {
      res.send(`
        <h1>Booking Successful 🎉</h1>
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
        <p>Event: ${event}</p>
        <p>Tickets: ${tickets}</p>
        <br>
        <a href="/">Go Back</a>
      `);
    }
  });
});


app.post("/task9-submit", (req, res) => {
    const { name, email, event, tickets } = req.body;
    const userData = { name, email, event, tickets };
    
    fs.writeFile('data.json', JSON.stringify(userData, null, 2), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error saving data");
        }
        res.render("result", { user: userData });
    });
});


app.get("/api/students", (req, res) => {
    db.query("SELECT * FROM students", (err, results) => {
        if(err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post("/api/students", (req, res) => {
    const { name, email, age, course } = req.body;
    db.query("INSERT INTO students (name, email, age, course) VALUES (?, ?, ?, ?)", 
        [name, email, age, course], (err, results) => {
        if(err) return res.status(500).json(err);
        res.json({ id: results.insertId, ...req.body });
    });
});

app.put("/api/students/:id", (req, res) => {
    const { name, email, age, course } = req.body;
    db.query("UPDATE students SET name=?, email=?, age=?, course=? WHERE id=?", 
        [name, email, age, course, req.params.id], (err, results) => {
        if(err) return res.status(500).json(err);
        res.json({ message: "Updated" });
    });
});

app.delete("/api/students/:id", (req, res) => {
    db.query("DELETE FROM students WHERE id=?", [req.params.id], (err, results) => {
        if(err) return res.status(500).json(err);
        res.json({ message: "Deleted" });
    });
});


app.get("/api/events", (req, res) => {
    db.query("SELECT * FROM events_crud", (err, results) => {
        if(err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post("/api/events", (req, res) => {
    const { event_name, event_date, location, description } = req.body;
    db.query("INSERT INTO events_crud (event_name, event_date, location, description) VALUES (?, ?, ?, ?)", 
        [event_name, event_date, location, description], (err, results) => {
        if(err) return res.status(500).json(err);
        res.json({ id: results.insertId, ...req.body });
    });
});

app.put("/api/events/:id", (req, res) => {
    const { event_name, event_date, location, description } = req.body;
    db.query("UPDATE events_crud SET event_name=?, event_date=?, location=?, description=? WHERE id=?", 
        [event_name, event_date, location, description, req.params.id], (err, results) => {
        if(err) return res.status(500).json(err);
        res.json({ message: "Updated" });
    });
});

app.delete("/api/events/:id", (req, res) => {
    db.query("DELETE FROM events_crud WHERE id=?", [req.params.id], (err, results) => {
        if(err) return res.status(500).json(err);
        res.json({ message: "Deleted" });
    });
});


app.post("/signup", (req, res) => {
    const { name, email, password } = req.body;
    db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", 
        [name, email, password], (err, results) => {
        if(err) {
            console.log(err);
            return res.send("Error creating user. User might already exist.");
        }
        res.redirect("/login.html");
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT * FROM users WHERE email=? AND password=?", 
        [email, password], (err, results) => {
        if(err) return res.status(500).send("Database Error");
        
        if(results.length > 0) {
            // Set Cookie Authentication
            res.cookie("authCookie", "authenticated_user_" + results[0].id, { maxAge: 900000, httpOnly: true });
            res.send(`
                <h1>Login Successful! 🎉</h1>
                <p>Welcome back, ${results[0].name}. Your session cookie has been set.</p>
                <br>
                <a href="/">Go Home</a>
            `);
        } else {
            res.send("<h1>Login Failed ❌</h1><p>Incorrect email or password.</p><br><a href='/login.html'>Try Again</a>");
        }
    });
});

// Start server
app.listen(PORT, () => {
  console.log("🚀 Server running at http://localhost:3000");
});