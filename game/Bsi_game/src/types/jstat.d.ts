declare module 'jstat' {
  interface Distribution {
    cdf(value: number, ...parameters: number[]): number
    inv(probability: number, ...parameters: number[]): number
  }
  interface JStat {
    normal: Distribution
    studentt: Distribution
  }
  const jStat: JStat
  export default jStat
}
