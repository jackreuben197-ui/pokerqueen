

export enum EMatchViewTabType {
    no = -1,
    chess = 0,
    sports = 1,
    game = 2,
    reality = 3
}

export type TMatchSportsDataType = {
    bgPath?: string,
    name?: string,
    url?: string
}

export type TMatchGameDataType = {
    bgPath?: string,
    name?: string,
    url?: string
}

export type TMatchRealityDataType = {
    bgPath?: string,
    name?: string,
    url?: string
}