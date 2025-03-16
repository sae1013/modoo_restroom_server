import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Place } from '../../places/entities/place.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  // onDelete: 'RESTRICT' 옵션을 지정하면, 해당 리뷰가 존재하는 경우 Place 삭제가 제한됩니다.
  @ManyToOne(() => Place, (place) => place.reviews, { onDelete: 'RESTRICT' })
  place: Place;
}
