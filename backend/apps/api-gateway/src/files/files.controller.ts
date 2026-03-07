import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('files')
export class FilesController {
  @Post('parse')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  async parseFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ text: string; filename: string }> {
    if (!file) throw new BadRequestException('No file uploaded');

    const ext = file.originalname.toLowerCase().split('.').pop();

    if (ext === 'txt') {
      return { text: file.buffer.toString('utf-8'), filename: file.originalname };
    }

    if (ext === 'pdf') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(file.buffer);
      return { text: data.text as string, filename: file.originalname };
    }

    if (ext === 'docx' || ext === 'doc') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return { text: result.value as string, filename: file.originalname };
    }

    throw new UnsupportedMediaTypeException('Only PDF, DOCX, and TXT files are supported');
  }
}
