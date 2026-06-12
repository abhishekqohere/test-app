export interface OrganizationDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationInput {
  name: string;
  description?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  description?: string;
}

export interface InviteMemberInput {
  email: string;
  role: import('../../utils/types').Role;
}
