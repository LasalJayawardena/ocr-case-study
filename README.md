# Machines That Learned to Read

Built by [lasal.ai](https://www.lasal.ai)

A century of OCR as one scrolling case study. A river meanders down the page. Each stop on it is one breakthrough, from the 1914 Optophone to 2026 document VLMs. Every stop has:
- an original animated diagram;
- what came before, the breakthrough and the measured result;
- a link to the paper.

Ten live, in-browser visualisers are linked where they belong in the story. Jargon is highlighted with a small icon for its kind of idea (learning, seeing, sequences, architecture, data, measuring, documents) and explains itself on hover, focus or tap.

## The visualisers it links
| # | Site | What it shows |
| --- | --- | --- |
| 1 | [MNIST Visualiser](https://mnist-visualizer.vercel.app) | a CNN reading a drawn digit |
| 2 | [CRNN Line Reader](https://crnn-line-reader.vercel.app) | CNN, BiLSTM and CTC on a whole line |
| 3 | [Tesseract Inside Out](https://tesseract-inside-out.vercel.app) | the classic engine and its LSTM |
| 4 | [Transformer OCR](https://transformer-ocr.vercel.app) | TrOCR and its attention |
| 5 | [PaddleOCR Viz](https://paddleocr-inside.vercel.app) | PP-OCRv6 and PaddleOCR-VL |
| 6 | [LLM-OCR Vis](https://llm-ocr-vis.vercel.app) | Qwen vs Gemma internals |
| 7 | [Qwen3-VL Viz](https://qwen3vl-inside.vercel.app) | a 2B VLM writing JSON |
| 8 | [Legacy IDP](https://legacy-idp.vercel.app) | OCR plus a rulebook |
| 9 | [SOTA IDP](https://sota-idp.vercel.app) | a five-pass VLM pipeline |
| 10 | [Weight-Space Programming](https://weight-space-programming-virid.vercel.app) | editing weights directly (password protected) |

## Build
```sh
node web/build.js        # writes public/index.html (everything inlined)
node tools/check.js out  # local browser check: screenshots at 1440 and 390 px, console errors, overflow, tooltips
```

**Where things live:**
- `web/content.js`: every word and number.
- `web/glossary.js`: the jargon.
- `web/illos.js`: the diagrams.
- `web/render.js`: the HTML.
- `web/case.css` and `web/case.js`: the river, reveals, tooltips and minimap.

**Preview images.** These are in `public/shots/` and come from `tools/shots.js`. Every capture is checked by eye before it is used, and views that show real documents are left out. Stops without an approved capture fall back to their diagram.

Figures are as reported in each paper. Most 2025 and 2026 benchmark numbers are self-reported by the model authors. All diagrams are original drawings, not reproductions of the papers' figures.
