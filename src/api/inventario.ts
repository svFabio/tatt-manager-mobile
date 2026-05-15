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
        if (body.foto) form.append('foto', body.foto as any);
        return api
            .post<ApiResponse<InventarioItem[]>>('/inventario', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then((r) => r.data);
    },
} as const;
