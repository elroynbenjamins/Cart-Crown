# Native PNG audit extension

The second native release build (36563091012) passed the repaired troop resources, then failed AAPT2 on the Spiritwood Spear equipment icon. Extending full PNG checks from units/enemies to all assets/game PNGs identified exactly two additional corrupt files: Spiritwood Spear and Trained Warg.

Trained Warg was recovered without redesign: a single compressed-byte error at IDAT payload offset 643 was corrected from 0 to 2. The recovered bytes match the original stored PNG CRC AND the original zlib Adler checksum, decode to the complete expected pixel data, and pass the full validator. Recovered Git blob: 9ee8fe7b656174235dd05dd605bde3652b2572fa.

Spiritwood Spear did not have a recoverable original in the available assets. Its corrupt PNG and registration are removed so the existing faction-aware Elven spear renderer is used. This is a temporary art fallback, not a replacement with another item's icon. The item, gameplay ID and stats are unchanged.

The native workflow now fails fast using the same full art:check and retains a small exact asset snapshot in its diagnostic artifact. The current 84 registered PNGs (units, enemies, equipment, faction crests) pass full decoding locally. Future assets must also satisfy the size/alpha contract; do not silently bypass integrity checks for new categories.
