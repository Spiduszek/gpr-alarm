import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {

  @ApiProperty({
    example: 'admin',
    description: 'Login użytkownika',
  })
  login!: string;

  @ApiProperty({
    example: 'Haslo123!',
    description: 'Hasło',
  })
  password!: string;

  @ApiProperty({
    example: 'Jan',
    description: 'Imię',
  })
  firstName!: string;

  @ApiProperty({
    example: 'Kowalski',
    description: 'Nazwisko',
  })
  lastName!: string;

  @ApiProperty({
    example: '600700800',
    description: 'Numer telefonu',
  })
  phone!: string;
}