import { Injectable } from '@nestjs/common';

/**
 * Service for root application logic.
 */
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
