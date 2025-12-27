import express from "express";
import { jwtverify } from "../middleware/protected.middleware.js";
import { Addcar, deletecar, getallcars, getcar, updatecar, getDealerCars, getRcDetails } from "../controllers/car.controller.js";
import { generateAIContent } from "../controllers/ai.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router()

router.post("/addcar", jwtverify, upload.fields([
    { name: 'images', maxCount: 15 },
    { name: 'damageImages', maxCount: 10 }
]), Addcar)
router.post("/generate-ai", upload.array("files", 10), generateAIContent);

router.get("/getallcars", getallcars)
router.get("/getcar/:id", getcar)
router.get("/getmycars", jwtverify, getDealerCars)
router.get("/rc/:registrationnumber", getRcDetails)
router.patch("/updatecar/:id", jwtverify, upload.fields([
    { name: 'images', maxCount: 15 },
    { name: 'damageImages', maxCount: 10 }
]), updatecar)
router.delete("/deletecar/:id", jwtverify, deletecar)

export default router