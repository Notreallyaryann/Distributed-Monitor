import express from "express";
import { prisma } from "../config/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const monitors = await prisma.monitor.findMany();
    res.json(monitors);
});

router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.monitor.update({
        where: { id: Number(id) },
        data: {
            status,
            lastCheckedAt: new Date()
        }
    });

    res.json(updated);
});

export default router;