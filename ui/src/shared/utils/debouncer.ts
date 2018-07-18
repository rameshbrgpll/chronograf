class Debouncer {
  private timers

  constructor() {
    this.timers = {}
  }

  public call(f, ms) {
    const timer = this.timers[f]

    if (timer) {
      clearTimeout(timer)
    }

    this.timers[f] = setTimeout(f, ms)
  }

  public cancel(f) {
    const timer = this.timers[f]

    if (timer) {
      clearTimeout(timer)
    }
  }

  public cancelAll() {
    for (const timer of this.timers) {
      clearTimeout(timer)
    }
  }
}

export default Debouncer
