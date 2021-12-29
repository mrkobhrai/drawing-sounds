export interface FetchDataBody {
    isAM: boolean,
    points: number[][],
    kernel: string,
    params: Map<string, number>,
    optimiseParams: boolean,
}

export interface FetchRequestBody {
    isAM: boolean,
    data: number[],
    params?: {
        name: string,
        value: number,
    }[]
    dataTag: number,
}