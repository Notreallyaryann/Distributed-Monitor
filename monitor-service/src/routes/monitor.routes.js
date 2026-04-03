import express from "express";
import { prisma } from "../config/prisma.js";

const router = express.Router();

// GET ALL MONITORS
router.get("/", async (req, res) => {
    try {
        const userEmail = req.headers["x-user-email"];
        
        const filter = userEmail ? { where: { userEmail } } : {};

        const monitors = await prisma.monitor.findMany({
            ...filter,
            orderBy: { createdAt: "desc" }
        });
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
        const userEmail = req.headers["x-user-email"];

        const monitor = await prisma.monitor.findUnique({
            where: { id: Number(id) }
        });

        if (!monitor || (userEmail && monitor.userEmail !== userEmail)) {
            return res.status(404).json({ message: "Monitor not found" });
        }

        res.json(monitor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch monitor" });
    }
});

// CREATE MONITOR
router.post("/", async (req, res) => {
    try {
        const { url, telegramToken, telegramChatId, webhookUrl } = req.body;
        const userEmail = req.headers["x-user-email"];

        if (!url || !userEmail) {
            return res.status(400).json({ message: "url and userEmail are required" });
        }

        // Basic URL validation
        try {
            new URL(url);
        } catch {
            return res.status(400).json({ message: "Invalid URL format" });
        }

        // Prevent duplicates for the same user
        const existing = await prisma.monitor.findFirst({
            where: { url, userEmail }
        });
        if (existing) {
            return res.status(409).json({ message: "Monitor for this URL already exists for your account", monitor: existing });
        }

        const monitor = await prisma.monitor.create({
            data: { 
                url, 
                userEmail,
                telegramToken,
                telegramChatId,
                webhookUrl
            }
        });

        res.status(201).json(monitor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create monitor" });
    }
});

// DELETE MONITOR
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userEmail = req.headers["x-user-email"];

        const monitor = await prisma.monitor.findUnique({
            where: { id: Number(id) }
        });

        if (!monitor || (userEmail && monitor.userEmail !== userEmail)) {
            return res.status(404).json({ message: "Monitor not found" });
        }

        await prisma.monitor.delete({ where: { id: Number(id) } });

        res.json({ message: "Monitor deleted", id: Number(id) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete monitor" });
    }
});

// UPDATE MONITOR STATUS
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status, lastCheckedAt, emailSent, latency, httpStatus, sslStatus, sslExpiresAt } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const updated = await prisma.monitor.update({
            where: { id: Number(id) },
            data: {
                status,
                lastCheckedAt: lastCheckedAt ? new Date(lastCheckedAt) : new Date(),
                ...(emailSent !== undefined && { emailSent }),
                ...(latency !== undefined && { latency }),
                ...(httpStatus !== undefined && { httpStatus }),
                ...(sslStatus !== undefined && { sslStatus }),
                ...(sslExpiresAt !== undefined && { sslExpiresAt: new Date(sslExpiresAt) })
            }
        });

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update monitor" });
    }
});

export default router;