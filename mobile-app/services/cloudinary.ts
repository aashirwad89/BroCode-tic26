// src/services/cloudinary.ts
// ─────────────────────────────────────────────────────────────
//  Cloudinary mein audio upload karo (unsigned preset)
//  Setup steps:
//    1. Cloudinary dashboard → Settings → Upload Presets
//    2. "Add upload preset" → Signing mode: "Unsigned"
//    3. Resource type: "Auto" rakho
//    4. Preset name + Cloud name niche daalo
// ─────────────────────────────────────────────────────────────

const CLOUDINARY_CLOUD_NAME = 'dji1t0vry';    // 🔁 apna cloud name daalo
const CLOUDINARY_UPLOAD_PRESET = 'shadowsafe'; // 🔁 unsigned preset name daalo
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;
// ⚠️  Audio bhi "video" endpoint pe jaati hai Cloudinary mein — yeh sahi hai

export interface CloudinaryUploadResult {
  secure_url: string;   // https://res.cloudinary.com/...
  public_id:  string;   // sos-recordings/sos_1234567890
  duration:   number;   // seconds
  format:     string;   // m4a
}

/**
 * Audio file ko Cloudinary pe upload karo
 * @param fileUri  — local file URI (expo-av ka getURI())
 * @returns        — Cloudinary secure URL ya empty string on failure
 */
export const uploadAudioToCloudinary = async (
  fileUri: string
): Promise<string> => {
  if (!fileUri) return '';

  try {
    console.log('[CLOUDINARY] ⬆️  Uploading audio...');

    // FormData banao — React Native style
    const formData = new FormData();

    formData.append('file', {
      uri:  fileUri,
      type: 'audio/m4a',          // Android default format
      name: `sos_${Date.now()}.m4a`,
    } as any);

    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder',        'sos-recordings');   // Cloudinary folder
    formData.append('resource_type', 'video');            // audio = video resource

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body:   formData,
      // ⚠️  Content-Type header SET MAT KARO — fetch khud set karta hai boundary ke saath
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[CLOUDINARY] Upload failed:', errText);
      return '';
    }

    const data: CloudinaryUploadResult = await response.json();
    console.log('[CLOUDINARY] ✅ Uploaded:', data.secure_url);
    return data.secure_url;

  } catch (err) {
    console.error('[CLOUDINARY] Error:', err);
    return '';
  }
};