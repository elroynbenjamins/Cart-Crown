# Quarantined original uploads

These are byte-preserved corrupted PNG uploads, renamed `.png.corrupt` so neither Metro nor Android AAPT2 packages them. They are diagnostic evidence, not runtime assets.

- Militia: original blob bac82e4fd4522f19883037c15494987f31295c3f
- Youngblood: original blob 58a4b7a9e51e4e077009e5dd25bccf1e08c35a42
- Spiritwood Spear: original blob d9fb7eb8c93d3d8c24c0e5256ff51cfc264d9893

Available source data did not permit verified pixel recovery for these three. Their gameplay IDs and existing code-rendered visual fallbacks are unchanged. Reviewed replacement PNGs remain outstanding. Do not suppress CRC/zlib validation, disable AAPT2 PNG processing, or re-register these corrupt files to conceal the build failure.

The other 13 corrupt images were recovered from source pixel grids or repairs constrained by the original PNG CRC and zlib checksum, and independently decoded before upload. Ranger was additionally losslessly recompressed with an identical RGBA pixel buffer.
