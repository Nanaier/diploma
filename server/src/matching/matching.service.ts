import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Service } from 'src/aws/s3.service';

interface Tag {
  tag: string;
  weight: number;
}

@Injectable()
export class MatchingService {
  constructor(
    private readonly prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  private calculateSimilarity(
    userTags: Tag[],
    psychologistTags: Tag[],
  ): number {
    const userTagMap = new Map(userTags.map((tag) => [tag.tag, tag.weight]));
    const psychologistTagMap = new Map(
      psychologistTags.map((tag) => [tag.tag, tag.weight]),
    );

    let similarityScore = 0;

    // Calculate intersection score
    for (const [tag, weight] of userTagMap) {
      if (psychologistTagMap.has(tag)) {
        const psychologistWeight = psychologistTagMap.get(tag) || 0;
        similarityScore += weight * psychologistWeight;
      }
    }

    return similarityScore;
  }

  private parseTags(tags: any): Tag[] {
    if (typeof tags === 'string') {
      try {
        return JSON.parse(tags);
      } catch (error) {
        console.error('Error parsing tags:', error);
        return [];
      }
    } else if (Array.isArray(tags)) {
      return tags;
    }
    return [];
  }

  async findBestExerciseMatch(userId: number): Promise<any> {
    // Get user tags
    const comment = await this.prisma.sessionComment.findFirst({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc', // Get most recent comment first
      },
      select: {
        id: true,
        comment: true,
        exerciseTags: true,
      },
    });
    if (!comment || !comment.exerciseTags) return [];

    const commentTags: Tag[] = this.parseTags(comment.exerciseTags);
    console.log(commentTags);

    if (commentTags.length === 0) return [];

    // Get all psychologists with related user info
    const allExercises = await this.prisma.exercise.findMany();

    // Calculate similarity for each psychologist
    const matches = allExercises.map((exercise) => {
      const exerciseTags: Tag[] = this.parseTags(exercise.tags);
      const similarity = this.calculateSimilarity(commentTags, exerciseTags);

      return { ...exercise, similarity };
    });

    matches.sort((a, b) => b.similarity - a.similarity);

    return matches.slice(0, 3); // Return top 3 matches
  }

  async findBestMatch(userId: number): Promise<any> {
    // Get user tags
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.searchTags)
      throw new Error('User not found or tags not available');

    const userTags: Tag[] = this.parseTags(user.searchTags);
    console.log(userTags);

    if (userTags.length === 0) return [];

    // Get all psychologists with related user info
    const psychologists = await this.prisma.psychologist.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            description: true,
            createdAt: true,
            role: true,
            status: true,
          },
        },
      },
    });

    // Calculate similarity for each psychologist
    const matchPromises = psychologists.map(async (psychologist) => {
      const psychologistTags: Tag[] = this.parseTags(psychologist.tags);
      const similarity = this.calculateSimilarity(userTags, psychologistTags);

      // Extract user information from psychologist's profile
      const psychologistUser = psychologist.user;
      const avatarUrl = psychologist.avatarUrl
        ? await this.s3Service.getFileUrl(psychologist.avatarUrl)
        : null;

      return {
        id: psychologist.id,
        userId: psychologist.userId,
        certUrl: psychologist.certUrl,
        avatarUrl: avatarUrl,
        description: psychologist.description,
        specialty: psychologist.specialty,
        phoneNumber: psychologist.phoneNumber,
        approved: psychologist.approved,

        user: {
          id: psychologistUser.id,
          email: psychologistUser.email,
          displayName: psychologistUser.displayName,
          description: psychologistUser.description,
          createdAt: psychologistUser.createdAt,
          role: psychologistUser.role,
          status: psychologistUser.status,
        },
        similarity,
      };
    });

    // Sort by similarity (descending)
    const matches = await Promise.all(matchPromises);

    // Sort by similarity (descending)
    matches.sort((a, b) => b.similarity - a.similarity);

    return matches.slice(0, 3); // Return top 3 matches
  }
}
