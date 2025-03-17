import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';

export enum PlaceTypeEnum {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

@Entity()
export class Place {
  @PrimaryGeneratedColumn()
  id: number;

  // 건물이름
  @Column()
  name: string;

  @Column()
  roadAddr: string;

  @Column({
    type: 'enum',
    enum: PlaceTypeEnum,
    unique: true,
    default: PlaceTypeEnum.PRIVATE,
    nullable: true,
  })
  type: PlaceTypeEnum;

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

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  ratingAverage: number;
}
