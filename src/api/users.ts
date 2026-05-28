import api from './axios';
import type { RolUsuario, Usuario } from '../types/usuarios';

export const UsersAPI = {
    getAll: (): Promise<Usuario[]> =>
        api.get<Usuario[]>('/users').then(r => r.data),

    updateRol: (id: number, rol: RolUsuario): Promise<Usuario> =>
        api.put<Usuario>(`/users/${id}`, { rol }).then(r => r.data),

    revocarAcceso: (id: number): Promise<void> =>
        api.delete(`/users/${id}`).then(() => undefined),

    getInvitationCode: (): Promise<string> =>
        api.get<{ codigo: string }>('/negocio/invitation-code').then(r => r.data.codigo),

    regenerateCode: (): Promise<string> =>
        api.post<{ codigo: string }>('/negocio/invitation-code/regenerate').then(r => r.data.codigo),
};
