import { AppException } from "@/common/errors/app-exception";

type MoneyInput = bigint | number | string;

function toBigInt(value: MoneyInput): bigint {
  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isInteger(value) || !Number.isSafeInteger(value)) {
      throw new AppException(422, "invalid_money_amount", "Money minor units must be a safe integer.");
    }

    return BigInt(value);
  }

  if (!/^-?\d+$/.test(value)) {
    throw new AppException(422, "invalid_money_amount", "Money minor units must be an integer string.");
  }

  return BigInt(value);
}

export class Money {
  private constructor(
    public readonly currency: string,
    public readonly minorUnits: bigint
  ) {}

  static fromMinorUnits(currency: string, minorUnits: MoneyInput): Money {
    return new Money(currency.toUpperCase(), toBigInt(minorUnits));
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.currency, this.minorUnits + other.minorUnits);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.currency, this.minorUnits - other.minorUnits);
  }

  negate(): Money {
    return new Money(this.currency, -this.minorUnits);
  }

  isNegative(): boolean {
    return this.minorUnits < 0n;
  }

  isZero(): boolean {
    return this.minorUnits === 0n;
  }

  toJSON(): { currency: string; minorUnits: number } {
    const numericMinorUnits = Number(this.minorUnits);

    if (!Number.isSafeInteger(numericMinorUnits)) {
      throw new AppException(500, "money_overflow", "Money value exceeds safe JSON integer range.");
    }

    return {
      currency: this.currency,
      minorUnits: numericMinorUnits
    };
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new AppException(422, "currency_mismatch", "Money currencies must match.");
    }
  }
}
