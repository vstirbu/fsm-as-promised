interface FsmErrorOptions {
  name: string;
  from: string;
  instanceId?: string;
  pending?: boolean;
}

export class FsmError extends Error {
  trigger: string;
  current: string;
  instanceId?: string;
  pending?: boolean;

  constructor(
    message: string,
    { name, from, instanceId, pending }: FsmErrorOptions
  ) {
    super(message);

    this.trigger = name;
    this.current = from;

    if (instanceId) {
      this.instanceId = instanceId;
    }

    if (pending) {
      this.pending = pending;
    }
  }
}
