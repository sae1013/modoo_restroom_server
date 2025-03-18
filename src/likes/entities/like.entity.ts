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
  REVIEW = 'REVIEW',
}

@Entity()
@Unique(['user', 'likeableId', 'likeableType'])
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  // 좋아요를 누른 사용자
  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  /*
    기본적으로 userId 컬럼이 생성됨. 하단의 user:는 TypeORM에서, JOIN 결과물을 해당 필드명에 말아서 내려준다는 의미임.
    따라서 칼럼명을 바꾸려면 @JoinColumn({ name: 'custom_user_field' }) 을 사용.
  */
  user: User;

  // 좋아요 대상의 ID (게시글이나 댓글의 기본 키. 하나의 FK로 여러테이블 동시참조 불가로, ID값으로 직접 조회)
  @Index()
  @Column()
  likeableId: number;

  // 좋아요 대상의 타입을 나타내는 컬럼
  @Index()
  @Column({
    type: 'enum',
    enum: LikeableType,
    unique: true,
  })
  likeableType: LikeableType;

  // 0: 비활성화, 1: 활성화
  @Column()
  flag: number;

  @CreateDateColumn()
  createdAt: Date;
}
