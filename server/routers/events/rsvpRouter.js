import { Router } from "express";

const router = Router();

router.get("/test", (req, res) => {
    res.send("hello from rsvp")
})

export default router;