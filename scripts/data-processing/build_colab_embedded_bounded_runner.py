"""Build a private, self-contained Colab notebook for one bounded v783 corridor.

The generated notebook embeds only a CUDA runner, a synthetic CUDA fixture, and
one signed corridor below the hard 2,000-node / 25,000-edge boundary. It never
embeds raw FlyWire source packs and refuses execution when any payload checksum
changes.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import io
import json
from pathlib import Path
import zipfile


PAYLOADS = {
    "run_v783_corridor_brian2cuda.py": Path("scripts/data-processing/run_v783_corridor_brian2cuda.py"),
    "brian2cuda_corridor_fixture_smoke.py": Path("scripts/data-processing/brian2cuda_corridor_fixture_smoke.py"),
    "corridor.json": Path("/home/ubuntu/webdev-static-assets/flywire-v783-sugar-mn9-corridor-v1/corridor.json"),
}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def markdown_cell(text: str) -> dict[str, object]:
    return {"cell_type": "markdown", "metadata": {}, "source": [text]}


def code_cell(source: str) -> dict[str, object]:
    return {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": [source]}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--template", type=Path, default=Path("scripts/data-processing/brian2cuda_v783_colab.ipynb"))
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    notebook = json.loads(args.template.read_text(encoding="utf-8"))
    payload_bytes: dict[str, bytes] = {}
    checksums: dict[str, str] = {}
    for filename, relative_path in PAYLOADS.items():
        payload = relative_path.read_bytes()
        payload_bytes[filename] = payload
        checksums[filename] = sha256(payload)

    archive_stream = io.BytesIO()
    with zipfile.ZipFile(archive_stream, mode="w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for filename, payload in payload_bytes.items():
            archive.writestr(filename, payload)
    archive_bytes = archive_stream.getvalue()
    archive_sha256 = sha256(archive_bytes)
    encoded_archive = base64.b64encode(archive_bytes).decode("ascii")
    encoded_chunks = [encoded_archive[offset : offset + 7_500] for offset in range(0, len(encoded_archive), 7_500)]

    notebook["cells"].extend(
        [
            markdown_cell(
                "## Private bounded payload delivery\n\n"
                "This cell extracts three embedded, checksum-verified files in `/content`. "
                "It contains no raw FlyWire pack and remains bounded to the official sugar→MN9 corridor."
            ),
            code_cell(
                "import base64, hashlib, io, zipfile\n"
                f"EMBEDDED_ARCHIVE_PARTS = {json.dumps(encoded_chunks)}\n"
                f"EXPECTED_ARCHIVE_SHA256 = '{archive_sha256}'\n"
                f"EXPECTED_SHA256 = {json.dumps(checksums)}\n"
                "archive_payload = base64.b64decode(''.join(EMBEDDED_ARCHIVE_PARTS).encode('ascii'))\n"
                "assert hashlib.sha256(archive_payload).hexdigest() == EXPECTED_ARCHIVE_SHA256\n"
                "with zipfile.ZipFile(io.BytesIO(archive_payload)) as archive:\n"
                "    for filename in EXPECTED_SHA256:\n"
                "        payload = archive.read(filename)\n"
                "        actual = hashlib.sha256(payload).hexdigest()\n"
                "        assert actual == EXPECTED_SHA256[filename], (filename, actual, EXPECTED_SHA256[filename])\n"
                "        with open('/content/' + filename, 'wb') as handle:\n"
                "            handle.write(payload)\n"
                "        print('Verified payload SHA-256:', filename, actual)\n"
            ),
            code_cell(
                "!python /content/run_v783_corridor_brian2cuda.py --preflight\n"
                "!python /content/brian2cuda_corridor_fixture_smoke.py\n"
                "!python /content/run_v783_corridor_brian2cuda.py --corridor /content/corridor.json --build-dir /content/v783-cuda-build --rate-hz 100 --expected-corridor-sha256 127dee3d0e1acb11f5eafe2a83424a97f9afdfa1c2716d7c1b1b2dcf5bbac8f5\n"
                "!sha256sum /content/v783-cuda-build/run-report.json\n"
                "!cat /content/v783-cuda-build/run-report.json\n"
            ),
        ]
    )
    notebook.setdefault("metadata", {}).setdefault("myGreatestSin", {})
    notebook["metadata"]["myGreatestSin"]["embeddedPayloadChecksums"] = checksums
    notebook["metadata"]["myGreatestSin"]["embeddedArchiveSha256"] = archive_sha256
    try:
        import nbformat

        nbformat.validate(nbformat.from_dict(notebook))
    except ImportError:
        print("WARNING: nbformat is unavailable; JSON syntax was still generated deterministically.")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(notebook, indent=1) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output), "archiveSha256": archive_sha256, "archiveBytes": len(archive_bytes), "payloadSha256": checksums}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
