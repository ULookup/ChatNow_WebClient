import type { BinaryWriter, BinaryReader } from '@protobuf-ts/runtime';

export function serialize<T extends object>(
  msg: T,
  type: { toBinary(msg: T, writer?: BinaryWriter): Uint8Array },
): Uint8Array {
  return type.toBinary(msg);
}

export function deserialize<T extends object>(
  bytes: Uint8Array,
  type: { fromBinary(bytes: Uint8Array, reader?: BinaryReader): T },
): T {
  return type.fromBinary(bytes);
}
