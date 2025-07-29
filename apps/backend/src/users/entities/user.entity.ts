import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { nanoid } from 'nanoid';
import { Url } from '../../url/entities/url.entity';

/**
 * Entity representing a user.
 */
@Entity('users')
export class User {
  @PrimaryColumn()
  id: string = nanoid();

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @OneToMany(() => Url, (url) => url.user)
  urls: Url[];
}