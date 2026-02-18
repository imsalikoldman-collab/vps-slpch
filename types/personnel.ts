export interface PersonnelCardDTO {
  id: number;
  displayOrder: number;
  registryId: string;
  fullName: string;
  role: string;
  status: string;
}

export interface PersonnelCardInput {
  displayOrder: number;
  registryId: string;
  fullName: string;
  role: string;
  status: string;
}
