import { BaseRepository } from '../../utils/baseRepository';
import { User, type IUser } from './users.model';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string, includePassword = false): Promise<IUser | null> {
    const query = User.findOne({
      email: email.toLowerCase(),
      $or: [{ isDeleted: { $ne: true } }, { isDeleted: { $exists: false } }],
    });
    if (includePassword) query.select('+password');
    return query;
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await User.countDocuments({
      email: email.toLowerCase(),
      $or: [{ isDeleted: { $ne: true } }, { isDeleted: { $exists: false } }],
    });
    return count > 0;
  }
}
