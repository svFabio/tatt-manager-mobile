import api from './axios';
import type { InventarioResponse, InventarioItem, AjusteRapidoBody, NuevoInsumoBody } from '../types/inventario';

type ApiResponse<T> = { ok: boolean; data: T };

export const InventarioAPI = {
    getInventario: (buscar?: string): Promise<ApiResponse<InventarioResponse>> =>
        api
            .get<ApiResponse<InventarioResponse>>('/inventario', {
                params: buscar ? { buscar } : undefined,
            })
            .then((r) => r.data),

    ajusteRapido: (body: AjusteRapidoBody): Promise<ApiResponse<InventarioItem>> =>
        api
            .patch<ApiResponse<InventarioItem>>('/inventario/ajuste-rapido', body)
            .then((r) => r.data),

    crearInsumo: (body: NuevoInsumoBody): Promise<ApiResponse<InventarioItem[]>> => {
        const form = new FormData();
        form.append('nombre', body.nombre);
        form.append('categoria', body.categoria);
        form.append('marca', body.marca);
        form.append('stockInicial', String(body.stockInicial));
        form.append('stockMinimo', String(body.stockMinimo));
        if (body.capSize) form.append('capSize', body.capSize);
        if (body.capMl) form.append('capMl', body.capMl);
        if (body.foto) form.append('foto', body.foto as unknown as Blob);
        return api
            .post<ApiResponse<InventarioItem[]>>('/inventario', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then((r) => r.data);
    },

    editarInsumo: (body: { tipo: string; refId: number; nombre: string; marca: string; cantidadMinima: number }): Promise<ApiResponse<InventarioItem>> =>
        api
            .put<ApiResponse<InventarioItem>>('/inventario/editar', body)
            .then((r) => r.data),

    eliminarInsumo: (body: { tipo: string; refId: number }): Promise<ApiResponse<{ message: string }>> =>
        api
            .delete<ApiResponse<{ message: string }>>(`/inventario/eliminar/${body.tipo}/${body.refId}`)
            .then((r) => r.data),
} as const;
