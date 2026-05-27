/**
 * Port for reading the current time. Tests inject a fixed clock so that
 * use cases depending on time-of-day or age-in-months are deterministic.
 */
export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
