// tagging.service.ts
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TaggingService {
  constructor(private readonly httpService: HttpService) {}

  async processPsychologistTags(psychologistId: number, text: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.post('http://localhost:8000/process-psychologist', {
          psychologist_id: psychologistId,
          text: text,
        }),
      );

      return response.data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async processUserPreferenceTags(userId: number, text: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.post('http://localhost:8000/process-user', {
          user_id: userId,
          text: text,
        }),
      );

      return response.data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async processEventCommentTags(eventId: number, text: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.post('http://localhost:8000/process-comment', {
          event_id: eventId,
          text: text,
        }),
      );

      return response.data;
    } catch (error) {
      throw new Error(error);
    }
  }
}
