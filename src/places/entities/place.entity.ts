import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';

@Entity()
export class Place {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  roadAddr: string;

  // 위도
  @Column({ type: 'double precision' })
  lat: number;

  // 경도
  @Column({ type: 'double precision' })
  lng: number;

  // 리뷰
  @OneToMany(() => Review, (review) => review.place)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
