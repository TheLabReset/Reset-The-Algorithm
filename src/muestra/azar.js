// Azar con semilla fija y distribuciones para conteos y costos. Sin dependencias.
// Generador de números con semilla fija; nadie fuera de src/muestra lo usa.

// mulberry32: rápido, 32 bits, suficiente para data de muestra (no criptográfico).
export function crearAzar(semilla) {
  let a = semilla >>> 0;
  const u = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const normal = () => {
    // Box-Muller; se descarta u = 0 para no tomar log(0)
    let x = 0;
    while (x === 0) x = u();
    return Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * u());
  };
  return {
    u,
    normal,
    // Ruido multiplicativo con mediana 1: lognormal(0, sigma)
    ruido: (sigma) => Math.exp(sigma * normal()),
    // Poisson: Knuth para medias chicas, aproximación normal redondeada y acotada en 0 para medias grandes
    poisson(media) {
      if (!(media > 0)) return 0;
      if (media < 40) {
        const L = Math.exp(-media);
        let k = 0, p = 1;
        do { k++; p *= u(); } while (p > L);
        return k - 1;
      }
      return Math.max(0, Math.round(media + Math.sqrt(media) * normal()));
    },
    // Binomial: de n intentos con probabilidad p. Garantiza 0 <= x <= n por construcción.
    binomial(n, p) {
      if (n <= 0 || p <= 0) return 0;
      if (p >= 1) return n;
      if (n < 60) { let x = 0; for (let i = 0; i < n; i++) if (u() < p) x++; return x; }
      const m = n * p, s = Math.sqrt(n * p * (1 - p));
      return Math.min(n, Math.max(0, Math.round(m + s * normal())));
    },
    elegir: (lista) => lista[Math.floor(u() * lista.length)],
  };
}
