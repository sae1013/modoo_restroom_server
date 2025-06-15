// 10000 이상 99999 이하의 5자리 난수를 생성합니다.
import { adjectives, noun } from './nicknames.const';

export function generateVerificationCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

export function getRandomNickName() {
  const _adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const _noun = noun[Math.floor(Math.random() * noun.length)];
  return _adjective + ' ' + _noun;
}
