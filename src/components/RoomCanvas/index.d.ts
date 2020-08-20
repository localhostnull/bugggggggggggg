export interface IBeginRec {
    x: number;
    y: number;
    imageData: ImageData;
}

export interface IVertex {
    top: number;
    left: number;
}

export interface IDrawInfo {
    x: number;
    y: number;
    type: string;
    color: string;
    width: number;
    w?: number;
    h?: number;
    a?: number;
    b?: number;
    paths?: Array<Array<string>>
}