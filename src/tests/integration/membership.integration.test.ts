import { MembershipService } from '../../modules/memberships/memberships.service';
import { MembershipRepository } from '../../modules/memberships/memberships.repository';
import { UserRepository } from '../../modules/users/users.repository';
import { OrganizationRepository } from '../../modules/organizations/organizations.repository';
import { hashPassword } from '../../utils/password';
import { User } from '../../modules/users/users.model';

describe('Membership integration', () => {
  const membershipService = new MembershipService(
    new MembershipRepository(),
    new UserRepository(),
  );
  const membershipRepo = new MembershipRepository();
  const orgRepo = new OrganizationRepository();

  it('adds and lists members', async () => {
    const password = await hashPassword('Password123!');
    const [owner, member] = await User.create([
      { email: 'owner@test.com', password, firstName: 'O', lastName: 'W', globalRole: 'Member' },
      { email: 'member@test.com', password, firstName: 'M', lastName: 'E', globalRole: 'Member' },
    ]);

    const org = await orgRepo.create({
      name: 'Mem Org',
      slug: 'mem-org',
      ownerId: owner._id,
    });

    await membershipRepo.create({
      userId: owner._id,
      organizationId: org._id,
      role: 'Owner',
    } as Parameters<typeof membershipRepo.create>[0]);

    const added = await membershipService.addMember(
      org._id.toString(),
      owner._id.toString(),
      'Owner',
      { userId: member._id.toString(), role: 'Member' },
    );

    expect(added.role).toBe('Member');
    const members = await membershipService.listMembers(org._id.toString());
    expect(members.length).toBe(2);
  });
});
