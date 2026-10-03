# Source data: provenance

`quran-morphology.txt` is the Quranic Arabic Corpus morphology data (version 0.4), kept here **unchanged**.

|               |                                                                                      |
| ------------- | ------------------------------------------------------------------------------------ |
| Original work | Quranic Arabic Corpus, Kais Dukes, https://corpus.quran.com                          |
| Obtained from | https://github.com/mustafa0x/quran-morphology (corrected fork), `master`, 2026-10-03 |
| Size          | 6,322,866 bytes, 130,030 lines                                                       |
| License       | GNU General Public License, with attribution to the Quranic Arabic Corpus            |
| Underlying text | Verified Quran text from the Tanzil project                                        |

Required by the corpus terms: clearly indicate the source as the Quranic Arabic Corpus and link to http://corpus.quran.com, and reproduce its copyright notice in works derived from it. Taysir does this on its About page and in the README.

## Line format

Tab-separated: `surah:ayah:word:segment`, Arabic form, part of speech (`N`, `V`, `P`), then `|`-separated features (`ROOT:`, `LEM:`, case, gender, and so on). A word may have several segments (prefix, stem, suffix).
