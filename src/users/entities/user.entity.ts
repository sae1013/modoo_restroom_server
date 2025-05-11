import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Membership } from '../../membership/entities/membership.entity';
import { Like } from '../../likes/entities/like.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  nickname?: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: false, nullable: true })
  admin?: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @ManyToOne(() => Membership, { nullable: true })
  @JoinColumn({ name: 'membership_id' })
  membership: Membership;

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];
}
