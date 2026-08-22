# Free Remote Hosting Research for DFLY Packs

## Current Official Findings

| Service | Official finding | Consequence for Digital Fly |
|---|---|---|
| Zenodo | Zenodo states it aims to keep its research-output service free, permits up to 50 GB and 100 files per record, and can grant a one-time increase up to 200 GB. It also explicitly prohibits splitting one large dataset across records to circumvent the 50 GB limit. | Strong candidate for a public, versioned, citable DFLY research release if the transformed pack is at or below the record limit and the publication is appropriate under FlyWire’s terms. It is not a general object-store substitute. |
| Hugging Face Hub | Hugging Face documents best-effort free storage for public repositories and asks that large public datasets be useful to the community; private storage above the free tier is billed. A current public issue reports browser CORS/Range limitations for direct frontend partial dataset access. | Possible public mirror only after a browser retrieval proof; it is not the primary recommendation for the current no-backend DFLY loader. It should not be used for private or access-controlled data in a fully free workflow. |
| Internet Archive | Internet Archive documents a public API for storage and retrieval of item data. | A possible preservation/download mirror, but it still needs a direct CORS and browser range-request proof before Digital Fly can use it as a live chunk source. |

## Preliminary Decision

For a completely free remote release that does not require the user’s computer to remain online, **Zenodo is the preferred first choice** when the converted DFLY package meets its fair-use and per-record limits. The browser should initially support **whole-chunk downloads** from the published record rather than claiming byte-range support. The converted pack will use at most 100 independently checksummed chunk files. If the output does not fit the documented record limit, the correct next step is to request a research quota increase from Zenodo, not to bypass the limit by spreading one dataset across artificial records.

## Sources

1. Zenodo FAQ, “What are the size limitations of Zenodo?” — https://support.zenodo.org/help/en-gb/1-upload-deposit/80-what-are-the-size-limitations-of-zenodo
2. Hugging Face Hub, “Storage limits” — https://huggingface.co/docs/hub/en/storage-limits
3. Hugging Face dataset frontend CORS/Range issue — https://github.com/huggingface/datasets/issues/7931
4. Internet Archive developer documentation — https://archive.org/developers/ias3.html

*Research checked on 2026-08-22. This document records hosting behavior, not a grant of rights to republish FlyWire-derived data.*
