#!/bin/bash

# Path to cryptocurrency-icons
ICON_SOURCE_DIR="./node_modules/cryptocurrency-icons/32/color"
ICON_DEST_DIR="./public/icons"

# Create destination directory if it doesn't exist
mkdir -p "$ICON_DEST_DIR"

# Base coin names directly mapped from Binance or your list
COINS=(
  btc eth bnb sol xrp doge ada trx link avax xlm bch dot ltc uni atom
  etc vet fil eos xtz neo mkr aave theta shib hbar ton
)

# Mapping for aliases: coin name used → actual icon filename
declare -A ALIASES=(
  [shib]="shiba"
  [hbar]="hedera-hashgraph"
  [ton]="toncoin"
)

# Copy matching icons
for coin in "${COINS[@]}"; do
  # Determine source filename (use alias if present)
  actual_name=${ALIASES[$coin]:-$coin}
  SRC="$ICON_SOURCE_DIR/$actual_name.png"
  DEST="$ICON_DEST_DIR/$coin.png"

  if [ -f "$SRC" ]; then
    cp "$SRC" "$DEST"
    if [[ "$actual_name" != "$coin" ]]; then
      echo "✅ Aliased: $actual_name.png → $coin.png"
    else
      echo "✅ Copied $coin.png"
    fi
  else
    echo "⚠️  Missing: $actual_name.png (for $coin)"
  fi
done

# Copy a default placeholder icon
DEFAULT_SRC="./my-icons/default.png"
DEFAULT_DEST="$ICON_DEST_DIR/default.png"

if [ -f "$DEFAULT_SRC" ]; then
  cp "$DEFAULT_SRC" "$DEFAULT_DEST"
  echo "✅ Default icon copied"
else
  echo "⚠️  Missing default.png – please add one to ./my-icons"
fi

echo "✅ All available icons copied to $ICON_DEST_DIR"
