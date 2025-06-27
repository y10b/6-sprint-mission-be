import { Router } from "express";
import upload from "../middlewares/upload.middleware";
import {
  uploadImage,
  generatePresignedUrl,
} from "../controllers/upload.controller";

const router = Router();

router.post("/", upload.single("image"), uploadImage);
router.post("/presigned", generatePresignedUrl);

export default router;
