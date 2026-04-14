export interface FirestoreCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  courseCount: number;
  createAt: Date; // Note: typo in user's spec, using createAt
}
