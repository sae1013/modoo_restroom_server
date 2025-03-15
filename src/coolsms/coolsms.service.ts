// coolsms.service.ts
import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CoolsmsService {
  constructor(private readonly httpService: HttpService,
              @Inject(ConfigService)
              private readonly configService: ConfigService,
  ) {
  }

  /**
   * 지정한 바이트 수만큼의 임의의 salt 문자열 생성 (hex 형식)
   * @param length 생성할 바이트 수 (default: 16)
   */
  private generateSalt(length: number = 16): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * HMAC-SHA256 알고리즘을 사용하여 Signature 생성
   * @param date ISO 8601 형식의 날짜 문자열
   * @param salt 생성된 salt 문자열
   * @param apiSecret 발급받은 API Secret
   */
  private generateSignature(date: string, salt: string, apiSecret: string): string {
    const data = date + salt;
    return crypto.createHmac('sha256', apiSecret).update(data).digest('hex');
  }

  async sendMessages(authCode: string): Promise<any> {
    const url = 'https://api.coolsms.co.kr/messages/v4/send-many/detail';

    // API Key와 Secret (실제 발급받은 값으로 대체)
    const apiKey = this.configService.get<string>('COOL_SMS_API_KEY') || '';
    const apiSecret = this.configService.get<string>('COOL_SMS_API_SECRET') || '';
    console.log(apiKey);

    // ISO 8601 형식의 현재 날짜와 시간 (UTC 기준)
    const date = new Date().toISOString();

    // 12~64바이트 범위 내의 임의의 salt (여기서는 16바이트 사용)
    const salt = this.generateSalt(16);

    // Signature 생성 (Date Time + Salt 를 데이터로, API Secret을 키로 HMAC-SHA256 적용)
    const signature = this.generateSignature(date, salt, apiSecret);

    // AuthenticationMethod는 HMAC-SHA256 선택
    const authenticationMethod = 'HMAC-SHA256';

    // Authorization 헤더 구성
    const authorizationHeader = `${authenticationMethod} apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;

    // 요청 본문 구성 (필수 필드: messages.from, messages.to, messages.text)
    const body = {
      messages: [
        {
          from: '01083619220',          // 발신번호 (예시)
          to: '01083619220',             // 수신번호 (예시)
          text: `5자리 인증코드: ${authCode}를 3분이내 입력해주세요`, // 메시지 내용
        },
      ],
    };

    // 헤더 구성
    const headers = {
      'Authorization': authorizationHeader,
      'Content-Type': 'application/json',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, body, { headers }),
      );
      return response.data;
    } catch (error) {
      // 필요에 따라 에러 핸들링 및 로깅
      throw new BadGatewayException('Cool SMS Api Server Error');
    }
  }
}
