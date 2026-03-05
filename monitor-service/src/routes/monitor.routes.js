import express from "express";
import { prisma } from "../config/prisma.js";

const router = express.Router();

// GET ALL MONITORS 
router.get("/", async (req, res) => {
    try {
        const monitors = await prisma.monitor.findMany();
        res.json(monitors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch monitors" });
    }
});

// GET MONITOR BY ID 
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const monitor = await prisma.monitor.findUnique({
            where: { id: Number(id) }
        });

        if (!monitor) {
            return res.status(404).json({ message: "Monitor not found" });
        }

        res.json(monitor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch monitor" });
    }
});
// UPDATE MONITOR STATUS 
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status, lastCheckedAt } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const updated = await prisma.monitor.update({
            where: { id: Number(id) },
            data: {
                status,
                lastCheckedAt: lastCheckedAt ? new Date(lastCheckedAt) : new Date()
            }
        });

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update monitor" });
    }
});

export default router;