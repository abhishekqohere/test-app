import { NotFoundError } from '../../utils/errors';
import type { CreateUserInput, UpdateUserInput, UserDTO } from './users.types';
import { UserRepository } from './users.repository';
import type { IUser } from './users.model';

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  toDTO(user: IUser): UserDTO {
    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      globalRole: user.globalRole,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getById(id: string): Promise<UserDTO> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError('User not found');
    return this.toDTO(user);
  }

  async getByEmail(email: string): Promise<IUser | null> {
    return this.userRepo.findByEmail(email);
  }

  async create(input: CreateUserInput): Promise<UserDTO> {
    const user = await this.userRepo.create({
      email: input.email.toLowerCase(),
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      globalRole: input.globalRole ?? 'Member',
    } as Record<string, unknown>);
    return this.toDTO(user);
  }

  async update(id: string, input: UpdateUserInput): Promise<UserDTO> {
    const user = await this.userRepo.updateById(id, input);
    if (!user) throw new NotFoundError('User not found');
    return this.toDTO(user);
  }
}
