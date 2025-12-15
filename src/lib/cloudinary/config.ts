export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};

export const uploadWidgetConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: 'label_designs',
  sources: ['local', 'url', 'camera'],
  multiple: false,
  maxFiles: 1,
  maxFileSize: 10000000,
  clientAllowedFormats: ['png', 'jpg', 'jpeg', 'svg', 'webp'],
  maxImageWidth: 4000,
  maxImageHeight: 4000,
  cropping: true,
  folder: 'customer_uploads',
  tags: ['user_design'],
};