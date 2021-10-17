export interface RequiredHandler {
    <T = string>(key: string | Array<string>): T;
    <T = string, R = T>(key: string | Array<string>, formatter: Formatter<T, R>): R;
}
export interface OptionalHandler {
    <T = string>(key: string | Array<string>): T;
    <T = string, R = T>(key: string | Array<string>, defaultValue: R): R;
    <T = string, R = T>(key: string | Array<string>, defaultValue: R, formatter: Formatter<T, R>): R;
}
export declare type Formatter<T, R> = (value: T) => R;
export declare type CustomErrorHandler = (missingRequired: Array<string>) => void | never;
export declare type CustomValidator<Q> = (values: Q, missingKeys: Array<string>, keysMarkedRequired: Array<string>, errorHandler: CustomErrorHandler) => void;
export declare type PickFromObjectOptions<Q> = {
    customErrorHandler?: CustomErrorHandler;
    customValidator?: CustomValidator<Q>;
    allowedDefaultValues: {
        undefined: boolean;
        null: boolean;
        emptyString: boolean;
    };
};
export declare const defaultFormatters: {
    isNot: (not: any) => (value: any) => boolean;
    toInt: (value: string) => number;
    toBoolean: (value: string) => boolean;
};
export declare const pickFromObject: <Q>(obj: Record<string, any>, val: (req: RequiredHandler, optional: OptionalHandler) => Q, options?: PickFromObjectOptions<Q> | undefined) => Q;
