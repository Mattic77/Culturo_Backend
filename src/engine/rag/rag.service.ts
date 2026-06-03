import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Difficulty, Quiz } from '@prisma/client';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private embeddings: OpenAIEmbeddings;
  private llm: ChatOpenAI;

  constructor(private prisma: PrismaService) {
    this.embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small',
    });
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.2,
    });
  }

  /**
   * Ingest raw text into the knowledge base.
   */
  async ingestData(content: string, metadata: any) {
    this.logger.log(`Ingesting data for ${metadata.country || 'unknown country'}`);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
    });

    const docs = await splitter.createDocuments([content], [metadata]);

    for (const doc of docs) {
      const [embedding] = await this.embeddings.embedDocuments([doc.pageContent]);
      
      const embeddingString = `[${embedding.join(',')}]`;

      await this.prisma.$executeRaw`
        INSERT INTO knowledge_base (id, content, embedding, metadata, "createdAt")
        VALUES (gen_random_uuid(), ${doc.pageContent}, ${embeddingString}::vector, ${JSON.stringify(doc.metadata)}::jsonb, NOW())
      `;
    }

    return { message: `${docs.length} chunks ingested successfully.` };
  }

  /**
   * Search for similar content in the knowledge base.
   */
  async searchKnowledge(query: string, limit = 3, minSimilarity = 0.5) {
    const [queryEmbedding] = await this.embeddings.embedDocuments([query]);
    const embeddingString = `[${queryEmbedding.join(',')}]`;

    const results: any[] = await this.prisma.$queryRaw`
      SELECT id, content, metadata, 1 - (embedding <=> ${embeddingString}::vector) as similarity
      FROM knowledge_base
      WHERE 1 - (embedding <=> ${embeddingString}::vector) > ${minSimilarity}
      ORDER BY similarity DESC
      LIMIT ${limit}
    `;

    return results;
  }

  /**
   * Generate a quiz based on the knowledge base.
   */
  async generateQuiz(countryId: string, categoryId: string, difficulty: Difficulty, count = 1) {
    // 1. Get context from metadata (country name, category name)
    const country = await this.prisma.country.findUnique({ where: { id: countryId } });
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });

    if (!country || !category) {
      throw new Error('Country or Category not found');
    }

    const query = `History, culture and facts about ${category.name} in ${country.name}`;
    const searchResults = await this.searchKnowledge(query, 5);

    if (searchResults.length === 0) {
      this.logger.warn(`No knowledge base entry found for ${query}. Using general LLM knowledge.`);
    }

    const context = searchResults.map(r => r.content).join('\n---\n');

    const prompt = `
      You are an expert quiz creator for the "Culturo" mobile game.
      Based on the provided context, generate ${count} quiz question(s) for the category "${category.name}" in "${country.name}".
      Difficulty level: ${difficulty}.

      Context:
      ${context || 'No specific context provided. Use your general knowledge but stay highly factual.'}

      RULES:
      1. Use ONLY the provided context if available to avoid hallucinations.
      2. Respond STRICTLY in JSON format as an array of objects.
      3. Each object must have: "question", "answer" (string), and "suggestedAnswer" (object with "options" array including the correct answer).

      JSON format example:
      [
        {
          "question": "What is the capital of France?",
          "answer": "Paris",
          "suggestedAnswer": { "options": ["Paris", "London", "Berlin", "Madrid"] }
        }
      ]
    `;

    const response = await this.llm.invoke(prompt);
    const content = response.content.toString();
    
    // Clean potential markdown code blocks
    const jsonStr = content.replace(/```json|```/g, '').trim();
    const generatedQuizzes = JSON.parse(jsonStr);

    // Save to database
    const savedQuizzes: Quiz[] = [];
    for (const q of generatedQuizzes) {
      const saved = await this.prisma.quiz.create({
        data: {
          question: q.question,
          answer: q.answer,
          suggestedAnswer: q.suggestedAnswer,
          categoryId: category.id,
          countryId: country.id,
          difficulty: difficulty
        }
      });
      savedQuizzes.push(saved);
    }

    return savedQuizzes;
  }
}
