import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
    res.send({ data: "Success" })
})

export default router;