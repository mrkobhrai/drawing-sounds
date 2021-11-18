import {
    alphaParam,
    amplitudeParam,
    lengthScaleParam,
    Parameter,
    periodParam
} from "./KernelParameter";

export interface Kernel {
    name: string,
    label: string,
    parameters: Parameter[],
}

export const exponentiatedQuadraticKernel: Kernel = {
    name: 'exponentiated_quadratic_kernel',
    label: 'Exponentiated Quadratic Kernel',
    parameters: [lengthScaleParam, amplitudeParam]
}

export const rationalQuadraticKernel: Kernel = {
    name: 'rational_quadratic_kernel',
    label: 'Rational Quadratic Kernel',
    parameters: [lengthScaleParam, alphaParam, amplitudeParam]
}

export const periodicKernel: Kernel = {
    name: 'periodic_kernel',
    label: 'Periodic Kernel',
    parameters: [lengthScaleParam, periodParam, amplitudeParam]
}

export const kernels = [exponentiatedQuadraticKernel, rationalQuadraticKernel, periodicKernel]