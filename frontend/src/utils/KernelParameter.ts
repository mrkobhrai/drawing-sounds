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
    min: 0,
    max: 10,
    default: 1,
}

export const amplitudeParam: Parameter = {
    name: 'amplitude',
    label: 'Amplitude',
    min: 0,
    max: 10,
    default: 1,
}

export const periodParam: Parameter = {
    name: 'period',
    label: 'Period',
    min: 0,
    max: 10,
    default: 1,
}

export const alphaParam: Parameter = {
    name: 'alpha',
    label: 'Alpha',
    min: 0,
    max: 10,
    default: 1,
}

export const periodicLengthScaleParam: Parameter = {
    name: 'periodic_lengthscale',
    label: 'Periodic Length Scale',
    min: 0,
    max: 10,
    default: 1,
}

export const localLengthScaleParam: Parameter = {
    name: 'local_lengthscale',
    label: 'Local length Scale',
    min: 0,
    max: 10,
    default: 1,
}