// ===========================================
// Upload Controller
// File upload API endpoints
// ===========================================

import {
    BadRequestException,
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    // ===========================================
    // Upload Avatar
    // ===========================================
    @Post('avatar')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Avatar yuklash' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Avatar yuklandi' })
    @ApiResponse({ status: 400, description: 'Noto\'g\'ri fayl' })
    async uploadAvatar(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser('id') userId: string,
    ) {
        if (!file) {
            throw new BadRequestException('Fayl yuklanmadi');
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!this.uploadService.validateFileType(file, allowedTypes)) {
            throw new BadRequestException('Faqat rasm fayllari qabul qilinadi');
        }

        const result = await this.uploadService.moveFile(file, 'avatars');
        return {
            success: true,
            data: result,
        };
    }

    // ===========================================
    // Upload Resume
    // ===========================================
    @Post('resume')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Rezyume yuklash' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Rezyume yuklandi' })
    @ApiResponse({ status: 400, description: 'Noto\'g\'ri fayl' })
    async uploadResume(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser('id') userId: string,
    ) {
        if (!file) {
            throw new BadRequestException('Fayl yuklanmadi');
        }

        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!this.uploadService.validateFileType(file, allowedTypes)) {
            throw new BadRequestException('Faqat PDF yoki Word fayllari qabul qilinadi');
        }

        const result = await this.uploadService.moveFile(file, 'resumes');
        return {
            success: true,
            data: result,
        };
    }

    // ===========================================
    // Upload Chat File
    // ===========================================
    @Post('chat')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Chat faylini yuklash' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Fayl yuklandi' })
    @ApiResponse({ status: 400, description: 'Noto\'g\'ri fayl' })
    async uploadChatFile(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser('id') userId: string,
    ) {
        if (!file) {
            throw new BadRequestException('Fayl yuklanmadi');
        }

        const result = await this.uploadService.moveFile(file, 'chat');
        return {
            success: true,
            data: {
                ...result,
                originalName: file.originalname,
            },
        };
    }

    // ===========================================
    // Delete File
    // ===========================================
    @Delete(':type/:filename')
    @ApiOperation({ summary: 'Faylni o\'chirish' })
    @ApiParam({ name: 'type', enum: ['avatars', 'resumes', 'chat', 'general'] })
    @ApiParam({ name: 'filename', description: 'Fayl nomi' })
    @ApiResponse({ status: 200, description: 'Fayl o\'chirildi' })
    async deleteFile(
        @Param('type') type: 'avatars' | 'resumes' | 'chat' | 'general',
        @Param('filename') filename: string,
        @CurrentUser('id') userId: string,
    ) {
        const deleted = await this.uploadService.deleteFile(filename, type);
        return {
            success: true,
            data: { deleted },
        };
    }
}
