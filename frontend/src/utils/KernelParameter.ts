export interface Parameter {
    name: string
    label: string
    min: number
    max: number
    default: number
}

export const lengthScaleParam: Parameter = {
    name: 'lengthscale',
    label: 'Length Scale',
    min: 1,
    max: 10,
    default: 1,
}

export const amplitudeParam: Parameter = {
    name: 'amplitude',
    label: 'Amplitude',
    min: 1,
    max: 10,
    default: 1,
}

export const periodParam: Parameter = {
    name: 'period',
    label: 'Period',
    min: 1,
    max: 10,
    default: 1,
}

export const alphaParam: Parameter = {
    name: 'alpha',
    label: 'Alpha',
    min: 1,
    max: 10,
    default: 1,
}