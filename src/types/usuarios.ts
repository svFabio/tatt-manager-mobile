export type RolUsuario = 'ADMIN' | 'ARTISTA';

export interface Usuario {
    id: number;
    nombre: string;
    email: string;
    rol: RolUsuario;
    creadoEn: string;
}
