import {
  Controller,
  Post,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

interface CandidateProfile {
  name: string;
  email: string;
  role: string;
}

function extractProfile(text: string): CandidateProfile {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // Name: first non-empty line (resumes almost always start with candidate name)
  const name = lines[0] ?? '';

  // Email: simple regex scan
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch?.[0] ?? '';

  // Role/title: first of the top lines (after name) that contains a job-title keyword and is short
  const titleKeywords = [
    'engineer', 'developer', 'designer', 'manager', 'analyst',
    'lead', 'architect', 'scientist', 'consultant', 'specialist',
    'director', 'intern', 'officer', 'executive',
  ];
  const role = lines.slice(1, 8).find(
    (l) => titleKeywords.some((k) => l.toLowerCase().includes(k)) && l.length < 80,
  ) ?? '';

  return { name, email, role };
}

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
    @Query('type') type?: string,
  ): Promise<{ text: string; filename: string; profile?: CandidateProfile }> {
    if (!file) throw new BadRequestException('No file uploaded');

    const ext = file.originalname.toLowerCase().split('.').pop();
    let text = '';

    if (ext === 'txt') {
      text = file.buffer.toString('utf-8');
    } else if (ext === 'pdf') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(file.buffer);
      text = data.text as string;
    } else if (ext === 'docx' || ext === 'doc') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      text = result.value as string;
    } else {
      throw new UnsupportedMediaTypeException('Only PDF, DOCX, and TXT files are supported');
    }

    if (type === 'resume') {
      return { text, filename: file.originalname, profile: extractProfile(text) };
    }

    return { text, filename: file.originalname };
  }
}
