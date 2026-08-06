import { ApiProperty } from '@nestjs/swagger';

export class SetActiveDto {
  @ApiProperty({
    example: false,
    description: 'Czy użytkownik jest aktywny',
  })
  active!: boolean;
}
