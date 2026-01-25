// ===========================================
// Upload Service
// File upload business logic
// ===========================================

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
    private uploadDir: string;
    private baseUrl: string;

    constructor(private configService: ConfigService) {
        this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || './uploads';
        // Backend 5000 portda ishlaydi
        this.baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:5000';

        // Ensure upload directory exists
        this.ensureUploadDir();
    }

    // ===========================================
    // Ensure upload directory exists
    // ===========================================
    private ensureUploadDir() {
        const dirs = ['avatars', 'resumes', 'chat', 'general'];

        dirs.forEach((dir) => {
            const fullPath = path.join(this.uploadDir, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
        });
    }

    // ===========================================
    // Get file URL - returns relative path for flexibility
    // Frontend will construct full URL based on current hostname
    // ===========================================
    getFileUrl(filename: string, type: 'avatars' | 'resumes' | 'chat' | 'general' = 'general'): string {
        // Return relative path - frontend handles full URL construction
        return `/uploads/${type}/${filename}`;
    }

    // ===========================================
    // Move uploaded file to specific directory
    // ===========================================
    async moveFile(
        file: Express.Multer.File,
        type: 'avatars' | 'resumes' | 'chat' | 'general' = 'general',
    ): Promise<{ url: string; filename: string; size: number }> {
        const destDir = path.join(this.uploadDir, type);
        const destPath = path.join(destDir, file.filename);

        // Move file
        fs.renameSync(file.path, destPath);

        return {
            url: this.getFileUrl(file.filename, type),
            filename: file.filename,
            size: file.size,
        };
    }

    // ===========================================
    // Delete file
    // ===========================================
    async deleteFile(filename: string, type: 'avatars' | 'resumes' | 'chat' | 'general' = 'general'): Promise<boolean> {
        const filePath = path.join(this.uploadDir, type, filename);

        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }

    // ===========================================
    // Validate file type
    // ===========================================
    validateFileType(file: Express.Multer.File, allowedTypes: string[]): boolean {
        return allowedTypes.includes(file.mimetype);
    }

    // ===========================================
    // Get file info
    // ===========================================
    getFileInfo(filename: string, type: 'avatars' | 'resumes' | 'chat' | 'general' = 'general') {
        const filePath = path.join(this.uploadDir, type, filename);

        if (!fs.existsSync(filePath)) {
            return null;
        }

        const stats = fs.statSync(filePath);

        return {
            filename,
            size: stats.size,
            createdAt: stats.birthtime,
            url: this.getFileUrl(filename, type),
        };
    }
}
