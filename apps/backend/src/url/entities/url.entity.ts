import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { nanoid } from 'nanoid';
import { User } from '../../users/entities/user.entity';

/**
 * Entity representing a shortened URL.
 */
@Entity('urls')
export class Url {
  @PrimaryColumn()
  id: string = nanoid();

  @Column({ unique: true })
  @Index({ unique: true })
  slug: string;

  @Column({ name: 'original_url' })
  originalUrl: string;

  @Column({ default: 0 })
  visits: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'user_id', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, (user) => user.urls)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
