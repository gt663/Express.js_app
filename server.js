const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Atlas connection
const uri = "mongodb+srv://hansnursin:qLWsMHqLo2tv2pp2@cluster0.ucosc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

let db, tasksCollection;

async function connectToDB() {
    try {
        await client.connect();
        db = client.db("todo-app");
        tasksCollection = db.collection("tasks");
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectToDB();

// API Routes

// GET all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await tasksCollection.find({}).toArray();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST a new task
app.post('/api/tasks', async (req, res) => {
    try {
        const newTask = req.body;
        const result = await tasksCollection.insertOne(newTask);
        const insertedTask = await tasksCollection.findOne({ _id: result.insertedId });
        res.status(201).json(insertedTask);
    } catch (error) {
        console.error("Error during POST request:", error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send(`Deleted task with id: ${id}`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT (Update) a task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedTask = req.body;

        const result = await tasksCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { action: updatedTask.action, done: updatedTask.done } }
        );

        if (result.modifiedCount > 0) {
            res.status(200).json({ message: `Task with id: ${id} updated` });
        } else {
            res.status(404).json({ message: `Task with id: ${id} not found` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
