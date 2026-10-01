import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import { join } from 'path';

export interface UploadResult {
  url: string;
  isCloud: boolean;
  filename: string;
  size: number;
  mimetype: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private supabase: SupabaseClient | null = null;
  private bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'heritage-media';

  constructor() {
    this.initSupabase();
  }

  private initSupabase() {
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://rikcqywntoycbrwolffl.supabase.co';

    const supabaseKey =
      (process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY.startsWith('sb_publishable_') ? process.env.SUPABASE_ANON_KEY : null) ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_KEY;

    if (supabaseKey) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: false,
          },
        });
        this.logger.log(`✓ Supabase Storage client initialized for bucket: ${this.bucketName} (${supabaseUrl})`);
      } catch (err: any) {
        this.logger.warn(`Failed to initialize Supabase client: ${err.message}. Falling back to local storage.`);
        this.supabase = null;
      }
    } else {
      this.logger.log(`ℹ No SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY found in .env. Uploads will be stored locally in /public/uploads.`);
    }
  }

  /**
   * Uploads an uploaded file (from Multer disk storage) to Supabase Cloud Storage.
   * If Supabase is not configured or upload fails, falls back safely to local path.
   */
  async uploadFile(file: any): Promise<UploadResult> {
    const filename = file.filename || `${Date.now()}-${file.originalname}`;
    const localUrl = `/uploads/${filename}`;
    const filePath = file.path || join(process.cwd(), 'public', 'uploads', filename);

    if (!this.supabase) {
      return {
        url: localUrl,
        isCloud: false,
        filename,
        size: file.size,
        mimetype: file.mimetype,
      };
    }

    try {
      const fileBuffer = file.buffer || (fs.existsSync(filePath) ? fs.readFileSync(filePath) : null);
      if (!fileBuffer) {
        throw new Error('File buffer is empty or could not be read from disk.');
      }

      // Determine clean folder path inside bucket (e.g., audio/, images/, videos/)
      let folder = 'media';
      if (file.mimetype.startsWith('audio/')) folder = 'audio';
      else if (file.mimetype.startsWith('image/')) folder = 'images';
      else if (file.mimetype.startsWith('video/')) folder = 'videos';

      const storagePath = `${folder}/${filename}`;

      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(storagePath, fileBuffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        // If bucket doesn't exist, log helpful diagnostic
        this.logger.warn(`[StorageService] Supabase upload error: ${error.message}. Falling back to local storage.`);
        return {
          url: localUrl,
          isCloud: false,
          filename,
          size: file.size,
          mimetype: file.mimetype,
        };
      }

      // Get public URL
      const { data: publicUrlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(storagePath);

      const publicUrl = publicUrlData.publicUrl;
      this.logger.log(`✓ [StorageService] Successfully uploaded to Supabase Storage: ${publicUrl}`);

      return {
        url: publicUrl,
        isCloud: true,
        filename,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (err: any) {
      this.logger.error(`[StorageService] Exception uploading to Supabase: ${err.message}. Using local URL.`);
      return {
        url: localUrl,
        isCloud: false,
        filename,
        size: file.size,
        mimetype: file.mimetype,
      };
    }
  }

  /**
   * Delete file from Supabase Storage if it's a cloud URL
   */
  async deleteFile(mediaUrl: string): Promise<boolean> {
    if (!this.supabase || !mediaUrl || !mediaUrl.includes('.supabase.co/storage/')) {
      return false;
    }

    try {
      // Extract storage path from URL
      // e.g. https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
      const marker = `/object/public/${this.bucketName}/`;
      if (mediaUrl.includes(marker)) {
        const storagePath = mediaUrl.split(marker)[1];
        if (storagePath) {
          await this.supabase.storage.from(this.bucketName).remove([storagePath]);
          this.logger.log(`[StorageService] Deleted cloud file from Supabase: ${storagePath}`);
          return true;
        }
      }
    } catch (err: any) {
      this.logger.warn(`[StorageService] Failed to delete cloud file: ${err.message}`);
    }
    return false;
  }
}
