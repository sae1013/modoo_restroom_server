import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum MembershipTierEnum {
  FREE = 'free',
  PREMIUM = 'premium',
  VIP = 'vip',
}

@Entity('membership')
export class Membership {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: MembershipTierEnum,
    unique: true,
  })
  name: MembershipTierEnum;

  @Column({ type: 'text', nullable: true })
  benefits: string; // 등급별 혜택 설명

  @Column({ type: 'decimal', precision: 10, nullable: true })
  price: number; // 등급별 가격 정보

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date; // 생성일시
}