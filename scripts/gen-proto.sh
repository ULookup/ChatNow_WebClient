#!/usr/bin/env bash
set -euo pipefail

PROTO_DIR="../ChatNow/proto"
OUT_DIR="src/proto"
PLUGIN_PATH="./node_modules/@protobuf-ts/plugin/bin/protoc-gen-ts"

# Ensure we're running from the project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

# Generate all service proto files in a single invocation for correct import resolution
# Use system protoc (not npx) with --experimental_allow_proto3_optional for proto3 optional fields
protoc \
  --experimental_allow_proto3_optional \
  --plugin="protoc-gen-ts=${PLUGIN_PATH}" \
  --ts_out "${OUT_DIR}" \
  --proto_path "${PROTO_DIR}" \
  "${PROTO_DIR}/common/envelope.proto" \
  "${PROTO_DIR}/common/types.proto" \
  "${PROTO_DIR}/identity/identity_service.proto" \
  "${PROTO_DIR}/relationship/relationship_service.proto" \
  "${PROTO_DIR}/conversation/conversation_service.proto" \
  "${PROTO_DIR}/transmite/transmite_service.proto" \
  "${PROTO_DIR}/message/message_types.proto" \
  "${PROTO_DIR}/message/message_service.proto" \
  "${PROTO_DIR}/media/media_service.proto" \
  "${PROTO_DIR}/presence/presence_service.proto" \
  "${PROTO_DIR}/push/notify.proto"

echo "Proto generation complete."
