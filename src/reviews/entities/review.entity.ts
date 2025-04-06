import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Place } from '../../places/entities/place.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  // onDelete: 'RESTRICT' 옵션을 지정하면, 해당 리뷰가 존재하는 경우 Place 삭제가 제한됩니다.
  @ManyToOne(() => Place, (place) => place.reviews, { onDelete: 'RESTRICT' })
  place: Place;

  // 부모레코드(유저)를 삭제할때, 해당 유저가 단 댓글을 모두 삭제한다.
  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  rating: number;

  @Column()
  content: string;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: false })
  option1: boolean;

  @Column({ default: false })
  option2: boolean;

  @Column({ default: false })
  option3: boolean;

  @Column({ default: false })
  option4: boolean;

  @Column({ default: false })
  option5: boolean;

  @Column({ default: false })
  option6: boolean;


}
