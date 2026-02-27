import { AdminRole } from '../types/adminAuthTypes';

export function canViewPlanning(_role: AdminRole): boolean {
  return true;
}

export function canManageServices(role: AdminRole): boolean {
  return role === 'ADMIN';
}

export function canManageStaff(role: AdminRole): boolean {
  return role === 'ADMIN';
}
