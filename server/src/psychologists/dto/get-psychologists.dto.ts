// src/psychologist/dto/get-psychologists.dto.ts
export class GetPsychologistsDto {
  page?: number = 1;
  limit?: number = 10;
  search?: string;
}
