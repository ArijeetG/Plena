import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'user' })
export class User extends BaseEntity {
  @Column({ type: String })
  name: string;

  @Column({ type: String })
  surname: string;

  @Column({ type: String })
  username: string;

  @Column({ type: String })
  password: string;

  @Column({ type: 'date' })
  birthdate: Date;

  @ManyToMany(() => User, (user) => user.blockedByUsers)
  @JoinTable()
  blockedUsers: User[];

  @ManyToMany(() => User, (user) => user.blockedUsers)
  blockedByUsers: User[];
}
