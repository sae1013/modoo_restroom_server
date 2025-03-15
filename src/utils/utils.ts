// 10000 이상 99999 이하의 5자리 난수를 생성합니다.
export function generateVerificationCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}
