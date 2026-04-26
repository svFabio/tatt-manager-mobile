// sirve para definir los tipos relacionados con las citas y solicitudes en la aplicación
export type SolicitudItem = {
    id: number
    estado: 'PENDIENTE' | 'CONFIRMADA' | 'FINALIZADA' | 'CANCELADA'
    descripcion?: string
    tamanoEnCm?: string
    zonaDelCuerpo?: string
    fotoReferenciaUrl?: string | null
    recibidaEn?: string | Date
    cliente?: {
        nombre?: string
        numeroWhatsapp?: string
    }
    // Compatibilidad con respuestas planas de /api/citas/*
    fechaHoraInicio?: string | Date | null
    clienteNombre?: string
    artistaNombre?: string
    recibido?: string | Date
}

// type para representar el estado de una cita, que puede ser pendiente, confirmada, finalizada o cancelada
export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'FINALIZADA' | 'CANCELADA'

//type para representar una cita, que incluye información como la fecha y hora de inicio, el nombre del cliente y del artista, la fecha de recepción y el estado de la cita
export type CitaItem = {
    id: number
    fechaHoraInicio: string | Date | null
    clienteNombre: string
    artistaNombre: string
    recibido: string | Date
    estado: EstadoCita
}

// type para representar los detaller completos de una cita
export type CitaDetails = {
    id: number
    negocioId: number
    fechaHoraInicio: string | Date
    recibido: string | Date
    referencia: string
    zona: string
    tamano: string
    clienteNombre: string
    artistaNombre: string
}