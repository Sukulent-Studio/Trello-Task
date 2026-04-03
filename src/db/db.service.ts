import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { db, pool } from './index';

@Injectable()
export class DbService implements OnModuleDestroy, OnModuleInit {
  public readonly db = db;

  async onModuleInit() {
    try {
      await pool.query('SELECT 1');
      console.log('Database connction establised');
    } catch (error) {
      console.error('Database connection failed: ', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await pool.end();
  }
}
