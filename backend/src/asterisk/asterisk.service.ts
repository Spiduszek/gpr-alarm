import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as net from 'net';

interface OriginateCallOptions {
  phone: string;
  alarmId: number;
  userId: number;
}

@Injectable()
export class AsteriskService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  private getAmiConfig() {
    const host =
      this.configService.get<string>('AMI_HOST') ??
      '127.0.0.1';

    const port = Number(
      this.configService.get<string>('AMI_PORT') ??
        5038,
    );

    const username =
      this.configService.get<string>(
        'AMI_USERNAME',
      );

    const password =
      this.configService.get<string>(
        'AMI_PASSWORD',
      );

    if (!username || !password) {
      throw new InternalServerErrorException(
        'Brak konfiguracji AMI.',
      );
    }

    return {
      host,
      port,
      username,
      password,
    };
  }

  private async sendAction(
    actionLines: string[],
    successText: string,
  ): Promise<string> {
    const {
      host,
      port,
      username,
      password,
    } = this.getAmiConfig();

    return new Promise((resolve, reject) => {
      const socket = net.createConnection({
        host,
        port,
      });

      let buffer = '';
      let loggedIn = false;
      let finished = false;

      const timeout = setTimeout(() => {
        if (finished) {
          return;
        }

        finished = true;
        socket.destroy();

        reject(
          new InternalServerErrorException(
            'Timeout połączenia z Asterisk AMI.',
          ),
        );
      }, 5000);

      const finish = () => {
        clearTimeout(timeout);
      };

      socket.on('connect', () => {
        socket.write(
          [
            'Action: Login',
            `Username: ${username}`,
            `Secret: ${password}`,
            'Events: off',
            '',
            '',
          ].join('\r\n'),
        );
      });

      socket.on('data', (data) => {
        buffer += data.toString();

        if (
          !loggedIn &&
          buffer.includes(
            'Message: Authentication accepted',
          )
        ) {
          loggedIn = true;
          buffer = '';

          socket.write(
            [
              ...actionLines,
              '',
              '',
            ].join('\r\n'),
          );

          return;
        }

        if (!loggedIn) {
          if (buffer.includes('Response: Error')) {
            finished = true;
            finish();
            socket.destroy();

            reject(
              new InternalServerErrorException(
                'Logowanie do Asterisk AMI nie powiodło się.',
              ),
            );
          }

          return;
        }

        if (buffer.includes('Response: Error')) {
          finished = true;
          finish();

          const response = buffer;

          socket.destroy();

          reject(
            new InternalServerErrorException(
              `Asterisk AMI zwrócił błąd: ${response}`,
            ),
          );

          return;
        }

        if (buffer.includes(successText)) {
          finished = true;
          finish();

          const response = buffer;

          socket.write(
            [
              'Action: Logoff',
              '',
              '',
            ].join('\r\n'),
          );

          socket.end();

          resolve(response);
        }
      });

      socket.on('error', (error) => {
        finish();

        if (!finished) {
          finished = true;

          reject(
            new InternalServerErrorException(
              `Błąd połączenia z AMI: ${error.message}`,
            ),
          );
        }
      });
    });
  }

  async ping(): Promise<{
    success: boolean;
    message: string;
  }> {
    await this.sendAction(
      ['Action: Ping'],
      'Ping: Pong',
    );

    return {
      success: true,
      message:
        'Połączenie z Asterisk AMI działa.',
    };
  }

  isCallingConfigured(): boolean {
  const trunk =
    this.configService.get<string>(
      'ASTERISK_TRUNK',
    );

  return Boolean(trunk?.trim());
}

  async originateCall(
    options: OriginateCallOptions,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const {
      phone,
      alarmId,
      userId,
    } = options;

    
    const trunk =
      this.configService.get<string>(
        'ASTERISK_TRUNK',
      );

    if (!trunk) {
      throw new InternalServerErrorException(
        'Brak konfiguracji ASTERISK_TRUNK.',
      );
    }

    await this.sendAction(
      [
        'Action: Originate',
        `Channel: PJSIP/${phone}@${trunk}`,
        'Context: gpr-alarm',
        'Exten: s',
        'Priority: 1',
        `Variable: ALARM_ID=${alarmId}`,
        `Variable: USER_ID=${userId}`,
        'Async: true',
      ],
      'Response: Success',
    );

    return {
      success: true,
      message:
        `Asterisk przyjął zlecenie połączenia dla użytkownika ${userId}.`,
    };
  }

    async originateCallsInBatches(
    calls: OriginateCallOptions[],
    batchSize = 5,
    delayMs = 2000,
  ): Promise<void> {
    if (!this.isCallingConfigured()) {
      console.log(
        'Telefonia nie jest skonfigurowana — pomijam serię połączeń.',
      );

      return;
    }

    for (
      let index = 0;
      index < calls.length;
      index += batchSize
    ) {
      const batch = calls.slice(
        index,
        index + batchSize,
      );

      console.log(
        `Asterisk: uruchamiam partię ${
          Math.floor(index / batchSize) + 1
        } (${batch.length} połączeń).`,
      );

      const results = await Promise.allSettled(
        batch.map((call) =>
          this.originateCall(call),
        ),
      );

      results.forEach((result, resultIndex) => {
        const call = batch[resultIndex];

        if (result.status === 'fulfilled') {
          console.log(
            `Asterisk: zlecono połączenie userId=${call.userId}, tel=${call.phone}.`,
          );
        } else {
          console.error(
            `Asterisk: błąd połączenia userId=${call.userId}, tel=${call.phone}:`,
            result.reason,
          );
        }
      });

      const hasNextBatch =
        index + batchSize < calls.length;

      if (hasNextBatch) {
        await new Promise<void>((resolve) =>
          setTimeout(resolve, delayMs),
        );
      }
    }
  }

}