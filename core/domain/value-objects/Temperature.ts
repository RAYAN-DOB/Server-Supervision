export class Temperature {
  private constructor(
    public readonly value: number,
    public readonly unit: "celsius" | "fahrenheit" = "celsius"
  ) {}

  static fromCelsius(value: number): Temperature {
    if (value < -50 || value > 150) throw new RangeError(`Invalid temperature: ${value}°C`);
    return new Temperature(value, "celsius");
  }

  static fromRaw(value: number): Temperature {
    return new Temperature(Math.round(value * 10) / 10, "celsius");
  }

  get celsius(): number { return this.value; }

  get status(): "normal" | "warning" | "critical" {
    if (this.value >= 35) return "critical";
    if (this.value >= 28) return "warning";
    if (this.value <= 10) return "warning";
    return "normal";
  }

  isAboveThreshold(warning: number, critical: number): "normal" | "warning" | "critical" {
    if (this.value >= critical) return "critical";
    if (this.value >= warning) return "warning";
    return "normal";
  }

  toString(): string {
    return `${this.value.toFixed(1)}°C`;
  }
}
