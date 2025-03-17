import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum LikeableType {
  PLACE = 'PLACE',
  COMMENT = 'COMMENT',
}

@Entity()
@Unique(['user', 'likeableId', 'likeableType'])
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  // 좋아요를 누른 사용자
  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  user: User;

  // 좋아요 대상의 ID (게시글이나 댓글의 기본 키)
  @Index()
  @Column({ type: 'varchar' })
  likeableId: string;

  // 좋아요 대상의 타입을 나타내는 컬럼
  @Index()
  @Column({
    type: 'enum',
    enum: LikeableType,
    unique: true,
  })
  likeableType: LikeableType;

  @CreateDateColumn()
  createdAt: Date;
}
