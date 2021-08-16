import Express from 'express';
import Cors from 'cors';
import FileUpload from 'express-fileupload';
import { v2 as Cloudinary } from 'cloudinary';
import { v4 as uuidV4 } from 'uuid';
import { config } from 'dotenv';
import 'regenerator-runtime/runtime';

config();
Cloudinary.config(true);

const PORT = process.env.PORT || 3000;

const app = Express();

/** File upload middleware */
app.use(FileUpload());
app.use(Cors());

app.get('/', (req, res) => {
  res.send({
    ok: true,
    message:
      "Welcome to api-pruebas-cloudinary, path: 'this.path'/api/upload, method: POST, formData: {image: File} ",
  });
});

app.post('/api/upload', (req, res) => {
  const typeAllowed = ['jpg', 'png', 'jpeg', 'gif'];

  try {
    /** Validate file exist */
    if (!req.files || Object.keys(req.files).length === 0) {
      return res
        .status(400)
        .json({ ok: false, message: 'No file was uploaded' });
    }

    const file = req.files.image;

    const nameArray = file.name.split('.');
    const extension = nameArray[nameArray.length - 1];

    if (!typeAllowed.includes(extension)) {
      return res.status(400).json({
        ok: false,
        message: 'File type not allowed',
      });
    }

    const imageName = `${uuidV4()}.${extension}`;

    const path = `./src/uploads/${imageName}`;

    file.mv(path, async (error) => {
      if (error) {
        return res.status(400).json({
          ok: false,
          message: 'Error to move image',
          error,
        });
      }

      const image = await uploadCloudinary(path);

      res.status(200).json({
        ok: true,
        message: 'File uploaded',
        imageName,
        image,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      message: 'Server error',
      error,
    });
  }
});

const uploadCloudinary = async (path) => {
  try {
    const image = await Cloudinary.uploader.upload(path, {
      folder: 'api-pruebas',
    });

    return image;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
