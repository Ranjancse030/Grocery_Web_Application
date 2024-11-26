import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const images = [
  { name: 'apples.jpg', url: 'https://images.pexels.com/photos/1510392/pexels-photo-1510392.jpeg?auto=compress&w=500' },
  { name: 'bananas.jpg', url: 'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg?auto=compress&w=500' },
  { name: 'milk.jpg', url: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&w=500' },
  { name: 'bread.jpg', url: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&w=500' },
  { name: 'eggs.jpg', url: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&w=500' },
  { name: 'carrots.jpg', url: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&w=500' },
  { name: 'yogurt.jpg', url: 'https://images.pexels.com/photos/373882/pexels-photo-373882.jpeg?auto=compress&w=500' },
  { name: 'tomatoes.jpg', url: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&w=500' },
  { name: 'cheese.jpg', url: 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&w=500' },
  { name: 'spinach.jpg', url: 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&w=500' },
  { name: 'avocados.jpg', url: 'https://images.pexels.com/photos/557659/pexels-photo-557659.jpeg?auto=compress&w=500' },
  { name: 'strawberries.jpg', url: 'https://images.pexels.com/photos/89778/strawberries-frisch-ripe-sweet-89778.jpeg?auto=compress&w=500' },
];

const downloadImage = async (url, filename) => {
  const imagePath = path.join(__dirname, '../../frontend/public/images', filename);
  const writer = fs.createWriteStream(imagePath);

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

const downloadAllImages = async () => {
  // Create images directory if it doesn't exist
  const imagesDir = path.join(__dirname, '../../frontend/public/images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  console.log('Downloading images...');
  for (const image of images) {
    try {
      await downloadImage(image.url, image.name);
      console.log(`Downloaded ${image.name}`);
    } catch (error) {
      console.error(`Error downloading ${image.name}:`, error.message);
    }
  }
  console.log('All images downloaded!');
};

downloadAllImages();
