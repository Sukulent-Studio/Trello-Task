import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTcxMTkwMDAwMCwiZXhwIjoxNzExOTAzNjAwfQ.abc123',
    description: 'JWT токен доступа',
  })
  access_token: string;

  @ApiProperty({
    example: 'bearer',
    description: 'Тип токена',
  })
  token_type: string;
}
