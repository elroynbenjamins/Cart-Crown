#!/usr/bin/env python3
"""Reproduce the owner's approved 16 Human battlefield sprites from original masters.

Originals are held on main in assets/game/Cart_Crown_Phase2_Human_Original_Master_Artwork.
The Phase 2 branch deliberately carries only game-ready 256px copies. The SHA256
checks below certify the generated PNG bytes match the approved ZIP exactly,
including the user-requested straightened red Spearman.
"""
from __future__ import annotations
import hashlib
import io
import json
from pathlib import Path
import subprocess
from PIL import Image

MASTER = "assets/game/Cart_Crown_Phase2_Human_Original_Master_Artwork"
TARGET = Path("assets/game/battle_directional/human")
CHECKSUMS = {
    "banner_captain_ally_back.png": "9dd4bdff8b31e0f84292bd4304671d6b33889daf6157683125e30237b5a921bf",
    "banner_captain_enemy_front.png": "396a3a0631476a609bee74e8d8c92f7ef0c4239f07ee19a7756a740d5713fa08",
    "crossbowman_ally_back.png": "4c4996e34d5fea108f413f136fafa94bfa660035ee128c1b3beb9710bb89f7c9",
    "crossbowman_enemy_front.png": "8748f27819b073ba71fcef0fc8a8002665f52eaa8a1bd4589cb4078dc15c5c5c",
    "field_medic_ally_back.png": "f78b3ca69a5822ddd8d236fbfee2d0aabf1aafbfd684fc634241f8b07e5e02f9",
    "field_medic_enemy_front.png": "1b14d7b20c9b113217f8e74f14594a222201e3513ae938f92bb868713f9b6d68",
    "great_sword_ally_back.png": "d24df42f4e2fb819cc4bb1ec2e70b1633e89e40dfaa592b371514742bd673114",
    "great_sword_enemy_front.png": "4fcb716377a87965cd7b68d3f9ebaa887f8eccbe3291145f15cb19c18bd6bc37",
    "heavy_cavalry_ally_back.png": "ad935fd4ac6d184a1c780981588954ca3f36e7ea777171af7b4bcaec73e6e746",
    "heavy_cavalry_enemy_front.png": "38a36a989f5e0b04c2b025e6a0b3f3293ac7965846fd769e5db20c3f3c5fa5a5",
    "ranger_ally_back.png": "38c3802c511333e2756804522c869c563d2f64c1358de31c7274673fe1f7c21a",
    "ranger_enemy_front.png": "b713b22effbf01d77eec075d4b11dd194141c5e4fc890ac9a00c1e9919b34d02",
    "shield_infantry_ally_back.png": "c4672069c701a3d82288ef7752b320279149981a91ec9ae7a893d79bb1573c97",
    "shield_infantry_enemy_front.png": "153900a2b43a4456df60b9276ee26709309a3a75d6332cd2203a5ba60c7d09a2",
    "spearman_ally_back.png": "36906b4e325b433135faf17096d0602414b6ded2b8ed21c3f7a65103892ae3b9",
    "spearman_enemy_front.png": "630ab18ffebbefbd4a8a0793cbbee47b8ba6742012ee529782effeabda533392",
}

def get_master(name: str) -> bytes:
    local = Path(MASTER) / name
    if local.is_file():
        return local.read_bytes()
    # Phase 2 predates the owner's upload to main. Fetch only the known source
    # branch and verify finished pixels against the preapproved checksum list.
    if not (Path(".git").exists() or Path(".git").is_file()):
        raise RuntimeError(f"Missing master {local}; run inside the Cart-Crown git checkout")
    return subprocess.check_output(["git", "show", f"origin/main:{MASTER}/{name}"])

def normalize(raw: bytes) -> bytes:
    source = Image.open(io.BytesIO(raw)).convert("RGBA")
    assert source.width > 256 and source.height > 256, "Expected original high-resolution source"
    alpha = source.getchannel("A")
    box = alpha.point(lambda value: 255 if value > 12 else 0).getbbox()
    assert box, "Source character is empty"
    source = source.crop(box)
    scale = min(238 / source.width, 232 / source.height)
    width, height = round(source.width * scale), round(source.height * scale)
    source = source.resize((width, height), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    canvas.alpha_composite(source, ((256 - width) // 2, 244 - height))
    data = io.BytesIO()
    canvas.save(data, format="PNG", optimize=True, compress_level=9)
    return data.getvalue()

def main() -> None:
    missing_masters = [name for name in CHECKSUMS if not (Path(MASTER) / name).is_file()]
    if missing_masters:
        subprocess.run(["git", "fetch", "origin", "main"], check=True)
    TARGET.mkdir(parents=True, exist_ok=True)
    entries = []
    for name, expected_hash in CHECKSUMS.items():
        png = normalize(get_master(name))
        actual = hashlib.sha256(png).hexdigest()
        if actual != expected_hash:
            raise RuntimeError(f"Approved art mismatch for {name}: {actual} != {expected_hash}")
        (TARGET / name).write_bytes(png)
        entries.append({
            "file": name,
            "view": "up/back" if name.endswith("ally_back.png") else "down/front",
            "note": "Reviewed fantasy Human battle actor: " + name[:-4].replace("_", " ") +
                    "; correct equipment and direction",
            "sha256": actual,
            "bytes": len(png),
        })
    manifest = {
        "version": 1,
        "approvedForRuntime": True,
        "reviewedBy": "Project owner visual approval (October 2026)",
        "style": "High-detail, crisp human pixel-art sprite silhouettes, blue/gold allied back, red/black enemy front",
        "screen": "portrait battlefield; stage actors only; never replace unit portrait rails",
        "entries": entries,
    }
    (TARGET / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"PASS: {len(entries)} approved 256px sprites generated and SHA256 verified "
          f"({sum(entry['bytes'] for entry in entries)} total bytes)")

if __name__ == "__main__":
    main()
