import { IsInt, IsString } from "class-validator";

export class CreateSessionCommentDto {
  @IsString()
  comment: string;

  @IsInt()
  eventId: number;

  @IsInt()
  psychologistId: number;

  @IsInt()
  userId: number;
}
