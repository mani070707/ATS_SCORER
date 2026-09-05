import hashlib
import re
from typing import Protocol

import numpy as np


class TextEmbedder(Protocol):
    def encode(self, text: str, convert_to_tensor: bool = False) -> np.ndarray: ...


class HashingTextEmbedder:
    """Small, stateless text embedder suitable for memory-limited CPU services.

    Word and character features are hashed into a fixed vector. It preserves
    lexical and fuzzy similarity without loading PyTorch or a transformer model.
    """

    def __init__(self, dimensions: int = 768) -> None:
        self.dimensions = dimensions

    def encode(self, text: str, convert_to_tensor: bool = False) -> np.ndarray:
        del convert_to_tensor
        vector = np.zeros(self.dimensions, dtype=np.float32)
        normalized = re.sub(r'[^a-z0-9+#.]+', ' ', text.lower()).strip()
        words = normalized.split()
        features = words + [f'{words[i]} {words[i + 1]}' for i in range(len(words) - 1)]
        compact = normalized.replace(' ', '_')
        features.extend(compact[i:i + 3] for i in range(max(0, len(compact) - 2)))

        for feature in features:
            digest = hashlib.blake2b(feature.encode('utf-8'), digest_size=8).digest()
            bucket = int.from_bytes(digest, 'big') % self.dimensions
            vector[bucket] += 1.0 if digest[0] & 1 else -1.0

        norm = float(np.linalg.norm(vector))
        return vector / norm if norm else vector
