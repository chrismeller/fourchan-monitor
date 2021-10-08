import { Test, TestingModule } from '@nestjs/testing';
import { SQLiteProvider } from './sqlite.provider';

describe('SsqliteProvider', () => {
  let provider: SQLiteProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SQLiteProvider],
    }).compile();

    provider = module.get<SQLiteProvider>(SQLiteProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
