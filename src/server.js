const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Schema
const travelBuddySchema = new mongoose.Schema({
    buddyId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    tripDuration: {
        type: String,
        required: true
    },
    interests: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
});

const TravelBuddy = mongoose.model("TravelBuddy", travelBuddySchema);


// ADD TRAVEL BUDDY
app.post("/api/buddies", async (req, res) => {
    try {
        const buddy = await TravelBuddy.create(req.body);
        res.json({
            success: true,
            message: "Travel buddy added successfully",
            data: buddy
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});


// GET ALL BUDDIES - DESCENDING BUDGET
app.get("/api/buddies", async (req, res) => {
    try {
        const buddies = await TravelBuddy
            .find()
            .sort({ budget: -1 });

        res.json(buddies);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// SEARCH BY BUDDY ID
app.get("/api/buddies/search/:buddyId", async (req, res) => {
    try {
        const buddy = await TravelBuddy.findOne({
            buddyId: req.params.buddyId
        });

        if (!buddy) {
            return res.status(404).json({
                message: "Travel buddy not found"
            });
        }

        res.json(buddy);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// DISPLAY ONLY NAME, DESTINATION, BUDGET, TRIP DURATION
app.get("/api/buddies/display", async (req, res) => {
    try {
        const buddies = await TravelBuddy
            .find()
            .select("name destination budget tripDuration -_id");

        res.json(buddies);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// DESTINATION + BUDGET GREATER THAN SPECIFIED AMOUNT
app.get("/api/buddies/filter", async (req, res) => {
    try {
        const { destination, budget } = req.query;

        const buddies = await TravelBuddy.find({
            destination: {
                $regex: destination,
                $options: "i"
            },
            budget: {
                $gt: Number(budget)
            }
        });

        res.json(buddies);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// UPDATE DESTINATION AND BUDGET
app.put("/api/buddies/:buddyId", async (req, res) => {
    try {
        const buddy = await TravelBuddy.findOneAndUpdate(
            { buddyId: req.params.buddyId },
            {
                destination: req.body.destination,
                budget: Number(req.body.budget)
            },
            { new: true }
        );

        if (!buddy) {
            return res.status(404).json({
                message: "Travel buddy not found"
            });
        }

        res.json({
            message: "Travel buddy updated successfully",
            data: buddy
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});


// INCREASE BUDGET FOR ALL BUDDIES OF A DESTINATION
app.put("/api/buddies/increase-budget", async (req, res) => {
    try {
        const { destination, amount } = req.body;

        const result = await TravelBuddy.updateMany(
            {
                destination: {
                    $regex: destination,
                    $options: "i"
                }
            },
            {
                $inc: {
                    budget: Number(amount)
                }
            }
        );

        res.json({
            message: "Budget increased successfully",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});


// FIND BUDDIES WITHIN BUDGET RANGE
app.get("/api/buddies/range", async (req, res) => {
    try {
        const { min, max } = req.query;

        const buddies = await TravelBuddy.find({
            budget: {
                $gte: Number(min),
                $lte: Number(max)
            }
        });

        res.json(buddies);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// DELETE USING BUDDY ID
app.delete("/api/buddies/:buddyId", async (req, res) => {
    try {
        const buddy = await TravelBuddy.findOneAndDelete({
            buddyId: req.params.buddyId
        });

        if (!buddy) {
            return res.status(404).json({
                message: "Travel buddy not found"
            });
        }

        res.json({
            message: "Travel buddy deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// FRONTEND
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log("MongoDB connection failed");
        console.log(error.message);
    });