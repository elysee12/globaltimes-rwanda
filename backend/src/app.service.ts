import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Global Times Rwanda Chronicle API';
  }
}

