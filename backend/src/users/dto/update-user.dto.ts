import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'spidi',
  })
  login?: string;

  @ApiPropertyOptional({
    example: 'Dominik',
  })
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Nowicki',
  })
  lastName?: string;

  @ApiPropertyOptional({
    example: '600123123',
  })
  phone?: string;

  @ApiPropertyOptional({
    example: 'noweHaslo123',
  })
  password?: string;
}
