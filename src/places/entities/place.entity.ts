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

  @Column()
  jibunAddr: string;

  @Column({
    type: 'enum',
    enum: PlaceTypeEnum,
    default: PlaceTypeEnum.PRIVATE,
    nullable: true,
  })
  type: PlaceTypeEnum;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: any; // 실제로는 GeoJSON 객체나 문자열을 저장할 수 있습니다.

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
