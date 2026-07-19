"""
Text Chunker
─────────────────────────────────────────────────────
Splits raw text into overlapping chunks for embedding.
Overlap ensures context is not lost at chunk boundaries.
"""

from dataclasses import dataclass


@dataclass
class Chunk:
    index: int
    content: str
    char_start: int
    char_end: int
    word_count: int


class TextChunker:

    def __init__(
        self,
        chunk_size: int = 400,
        overlap: int = 80,
    ):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk(self, text: str, source: str = "") -> list[Chunk]:
        """
        Split text into overlapping word-based chunks.
        """
        words = text.split()
        chunks: list[Chunk] = []
        step = self.chunk_size - self.overlap
        index = 0

        i = 0
        while i < len(words):
            window = words[i : i + self.chunk_size]
            content = " ".join(window)

            char_start = len(" ".join(words[:i]))
            char_end = char_start + len(content)

            chunks.append(
                Chunk(
                    index=index,
                    content=content,
                    char_start=char_start,
                    char_end=char_end,
                    word_count=len(window),
                )
            )

            index += 1
            i += step

        return chunks

    def chunk_by_paragraph(self, text: str) -> list[Chunk]:
        """
        Split text by paragraphs first, then by size.
        Better for structured documents.
        """
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        all_chunks: list[Chunk] = []
        index = 0

        for para in paragraphs:
            if len(para.split()) <= self.chunk_size:
                all_chunks.append(
                    Chunk(
                        index=index,
                        content=para,
                        char_start=0,
                        char_end=len(para),
                        word_count=len(para.split()),
                    )
                )
                index += 1
            else:
                sub_chunks = self.chunk(para)
                for c in sub_chunks:
                    c.index = index
                    all_chunks.append(c)
                    index += 1

        return all_chunks


chunker = TextChunker()
