import multer from "multer";
import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { readFile } from "fs";
import { join } from "path";
import { config } from "dotenv";
config();

const cloudinary_api_key = process.env.CLOUDINARY_API_KEY;
const cloudinary_api_secret = process.env.CLOUDINARY_API_SECRET;
const cloudinary_api_cloud_name = process.env.CLOUDINARY_API_NAME;

cloudinary.config({
  cloud_name: cloudinary_api_cloud_name,
  api_key: cloudinary_api_key,
  api_secret: cloudinary_api_secret,
  secure: true,
});

export const uploadFile = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      console.error("No file provided for upload");
    }

    const filePath = file.path;

    if (!filePath) {
      console.error("File path not available");
    }

    cloudinary.uploader.upload(
      filePath,
      {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
        }
        if (!result?.secure_url) {
          reject(new Error("No secure URL returned from Cloudinary"));
          return;
        }
        resolve(result.secure_url);
      }
    );
  });
};

const getExtensation = (ext: string) => {
  let ex = "";
  switch (ext) {
    case "image/jpeg":
      ex = "jpg";
      break;
    case "image/png":
      ex = "png";
      break;
    default:
      ex = "jpg";
  }
  return ex;
};
const MulterFilterFile = (req: any, file: any, cb: any) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  cb(null, uniqueSuffix + "-" + file.originalname);
};
export const storage = multer.diskStorage({
  destination: "uploads",
  filename: MulterFilterFile,
});
interface RequestParams extends Request {
  params: {
    filename: string;
  };
}
export const ReadFileName = (req: RequestParams, res: Response) => {
  const { filename } = req.params;
  const path = join(__dirname, "../../uploads/" + filename);
  readFile(path, (error, result) => {
    if (error) {
      console.log(error);
      res.send(error);
    }
    res.send(result);
  });
};
