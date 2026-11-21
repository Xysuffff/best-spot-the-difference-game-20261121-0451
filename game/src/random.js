// Seeded random number generator (Mulberry32)
export function createRandom(seed) {
  let state = seed >>> 0;
  return {
    next() {
      state += 0x6D2B79F5;
      let z = state;
      z = Math.imul(z ^ (z >>> 15), 1 | z);
      z ^= z + Math.imul(z ^ (z >>> 7), 61 | z);
      return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
    },
    nextInt(max) {
      return Math.floor(this.next() * max);
    },
    nextFloat(min, max) {
      return min + this.next() * (max - min);
    },
    nextBool(prob = 0.5) {
      return this.next() < prob;
    },
    choice(arr) {
      return arr[this.nextInt(arr.length)];
    },
    shuffle(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = this.nextInt(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
  };
}
