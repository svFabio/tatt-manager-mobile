export interface InventarioItem {
    tipo: 'tinta' | 'aguja';
    refId: number;
    nombre: string;
    marca: string;
    cantidadActual: number;
    cantidadMinima: number;
    unidad: string;
    esBajo: boolean;
    colorHex?: string;
}

export interface InventarioStats {
    totalItems: number;
    enStockBajo: number;
    enStockNormal: number;
}

export interface InventarioResponse {
    stats: InventarioStats;
    items: InventarioItem[];
}

export interface AjusteRapidoBody {
    tipo: 'tinta' | 'aguja';
    refId: number;
    delta: number;
}

export type Categoria = 'TINTA' | 'AGUJA' | 'CAP';

export interface FotoAsset {
    uri: string;
    name: string;
    type: string;
}

export interface NuevoInsumoBody {
    nombre: string;
    categoria: Categoria;
    marca: string;
    stockInicial: number;
    stockMinimo: number;
    foto?: FotoAsset;
    capSize?: string;
    capMl?: string;
}
