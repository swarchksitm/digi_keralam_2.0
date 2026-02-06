export interface District {
    id: number;
    name: string;
    code: string;
}

export interface Block {
    id: number;
    name: string;
    code: string;
    district: number;
}

export interface LSGI {
    id: number;
    name: string;
    kind: string; // 'GP', 'M', 'C' etc. (backend calls it 'kind' or 'lsgi_type'?) 
    // Checked models.py earlier: it is 'lsgi_type'. Let's check serializer or model again if needed.
    // Model has `lsgi_type`. Serializer usually exposes it same name.
    lsgi_type: string;
    block: number;
    district: number;
}

export interface Ward {
    id: number;
    number: number;
    name: string;
    lsgi: number;
}
