import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * IStorageService — Abstracted file storage.
 *
 * TODO: Implement S3Provider for production.
 * Set STORAGE_PROVIDER=s3 and configure AWS_* env vars.
 * See .env.example for required S3 environment variables.
 */
export interface IStorageService {
  upload(buffer: Buffer, filename: string, mimeType: string): Promise<string>;
  delete(fileUrl: string): Promise<void>;
  getUrl(key: string): string;
}

@Injectable()
export class StorageService implements IStorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly localPath: string;

  constructor(private readonly config: ConfigService) {
    this.localPath = this.config.get('STORAGE_LOCAL_PATH') || './uploads';
    // Ensure uploads directory exists
    const dirs = ['avatars', 'questions'].map((d) => path.join(this.localPath, d));
    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
    this.logger.log(`Storage initialized: local disk at ${this.localPath}`);
  }

  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    const provider = this.config.get('STORAGE_PROVIDER') || 'local';

    if (provider === 's3') {
      // TODO: Implement S3 upload
      // const s3 = new S3Client({ region: process.env.AWS_S3_REGION });
      // await s3.send(new PutObjectCommand({ Bucket, Key, Body, ContentType }));
      throw new Error('S3 storage not yet configured. Set STORAGE_PROVIDER=local for dev.');
    }

    // Local disk storage
    const filePath = path.join(this.localPath, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${filename}`;
  }

  async delete(fileUrl: string): Promise<void> {
    const filePath = path.join(this.localPath, fileUrl.replace('/uploads/', ''));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  getUrl(key: string): string {
    return `/uploads/${key}`;
  }
}
