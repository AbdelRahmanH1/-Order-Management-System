import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await (service as any).$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect to Prisma client', async () => {
    const prismaClient = (service as any).$connect();

    expect(prismaClient).toBeTruthy();
  });
});
