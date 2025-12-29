function createQuranWidget(verseData, storedQuran) {
  // Ensure font is loaded
  if (!document.getElementById("quran-font")) {
    const fontLink = document.createElement("link");
    fontLink.id = "quran-font";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);
  }

  const widget = document.createElement("div");
  // Normal style (Gray/Blue theme), Full Width, Not Fixed
  widget.className = `
    bg-[#1F212A] 
    border border-[#4E5567] 
    p-4 
    w-full 
    shadow-lg 
    flex flex-col items-center text-center gap-3
  `;

  // Decorative Element (Top)
  const decoration = document.createElement("div");
  decoration.className = "text-[#4E5567] opacity-50 text-xl";
  decoration.innerHTML = "۞";
  widget.appendChild(decoration);

  // Arabic Text (created early so selector can update it)
  const arabicText = document.createElement("div");
  arabicText.className = "text-white text-2xl md:text-3xl dir-rtl ";
  arabicText.style.fontFamily = "'Amiri', serif";
  arabicText.style.lineHeight = "2";
  arabicText.innerText = verseData?.arabic ?? "";

  // Reference (always present; we toggle visibility)
  const reference = document.createElement("div");
  reference.className =
    "mt-1 px-3 py-0.5 border border-[#4E5567] text-[#4E5567] text-[10px] font-bold uppercase tracking-[0.2em]";
  reference.innerText = verseData?.reference ?? "";
  reference.style.display = reference.innerText ? "" : "none";

  // Surah/Ayah selector
  if (typeof quran !== "undefined" && Array.isArray(quran?.surahs)) {
    const selectorRow = document.createElement("div");
    selectorRow.className = "w-full flex items-center justify-end gap-2";

    const surahSelect = document.createElement("select");
    surahSelect.className =
      "bg-[#1F212A] border border-[#4E5567] text-[#4E5567] text-xs px-2 py-1 outline-none hover:text-white focus:text-white focus:border-[#4E5567] transition-colors";

    const ayahSelect = document.createElement("select");
    ayahSelect.className =
      "bg-[#1F212A] border border-[#4E5567] text-[#4E5567] text-xs px-2 py-1 outline-none hover:text-white focus:text-white focus:border-[#4E5567] transition-colors";

    const initialSurahIndex = Number.isInteger(storedQuran?.nextSurahIndex)
      ? storedQuran.nextSurahIndex
      : 0;
    const initialAyahIndex = Number.isInteger(storedQuran?.nextAyahIndex)
      ? storedQuran.nextAyahIndex
      : 0;

    const surahs = quran.surahs;

    for (let i = 0; i < surahs.length; i++) {
      const option = document.createElement("option");
      option.value = String(i);
      option.textContent = `${surahs[i].number}. ${surahs[i].englishName}`;
      surahSelect.appendChild(option);
    }

    const fillAyahOptions = (surahIndex, selectedAyahIndex) => {
      const safeSurahIndex = Math.min(
        Math.max(0, surahIndex),
        Math.max(0, surahs.length - 1)
      );
      const ayahCount = surahs[safeSurahIndex]?.ayahs?.length ?? 0;

      ayahSelect.innerHTML = "";
      for (let n = 1; n <= ayahCount; n++) {
        const option = document.createElement("option");
        option.value = String(n - 1); // store as 0-based index
        option.textContent = `Ayah ${n}`;
        ayahSelect.appendChild(option);
      }

      const safeAyahIndex = Math.min(
        Math.max(0, selectedAyahIndex),
        Math.max(0, ayahCount - 1)
      );
      ayahSelect.value = String(safeAyahIndex);
    };

    surahSelect.value = String(
      Math.min(Math.max(0, initialSurahIndex), surahs.length - 1)
    );
    fillAyahOptions(Number(surahSelect.value), initialAyahIndex);

    const renderFromSelection = () => {
      const surahIndex = Number(surahSelect.value);
      const ayahIndex = Number(ayahSelect.value);

      if (typeof getNextAyahs === "function") {
        const verce = getNextAyahs(surahIndex, ayahIndex);
        if (verce) {
          arabicText.innerText = verce.ayah ?? "";
          reference.innerText = `${verce.surah} ${verce.ayahNumber}`;
          reference.style.display = reference.innerText ? "" : "none";
          return;
        }
      }

      const selectedSurah = quran.surahs?.[surahIndex];
      const selectedAyah = selectedSurah?.ayahs?.[ayahIndex];
      arabicText.innerText = selectedAyah?.text ?? "";
      reference.innerText = selectedSurah
        ? `${selectedSurah.englishName} ${
            selectedAyah?.numberInSurah ?? ""
          }`.trim()
        : "";
      reference.style.display = reference.innerText ? "" : "none";
    };

    const persistSelection = async () => {
      const nextSurahIndex = Number(surahSelect.value);
      const nextAyahIndex = Number(ayahSelect.value);
      await chrome.storage.local.set({
        quran: {
          nextSurahIndex,
          nextAyahIndex,
        },
      });
    };

    surahSelect.addEventListener("change", async () => {
      fillAyahOptions(Number(surahSelect.value), 0);
      await persistSelection();
      renderFromSelection();
    });

    ayahSelect.addEventListener("change", async () => {
      await persistSelection();
      renderFromSelection();
    });

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className =
      "bg-[#1F212A] border border-[#4E5567] text-[#4E5567] text-xs px-2 py-1 outline-none hover:text-white focus:text-white transition-colors";
    nextButton.textContent = "Next";

    nextButton.addEventListener("click", async () => {
      const currentSurahIndex = Number(surahSelect.value);
      const currentAyahIndex = Number(ayahSelect.value);

      let nextSurahIndex = currentSurahIndex;
      let nextAyahIndex = currentAyahIndex + 1;

      if (typeof getNextAyahs === "function") {
        const verce = getNextAyahs(currentSurahIndex, currentAyahIndex);
        if (verce) {
          nextSurahIndex = verce.nextSurahIndex;
          nextAyahIndex = verce.nextAyahIndex;
        }
      } else {
        const currentAyahCount = surahs[currentSurahIndex]?.ayahs?.length ?? 0;
        if (nextAyahIndex >= currentAyahCount) {
          nextSurahIndex = Math.min(currentSurahIndex + 1, surahs.length - 1);
          nextAyahIndex = 0;
        }
      }

      surahSelect.value = String(
        Math.min(Math.max(0, nextSurahIndex), surahs.length - 1)
      );
      fillAyahOptions(Number(surahSelect.value), nextAyahIndex);

      await persistSelection();
      renderFromSelection();
    });

    selectorRow.appendChild(surahSelect);
    selectorRow.appendChild(ayahSelect);
    selectorRow.appendChild(nextButton);
    widget.appendChild(selectorRow);

    // Initial render based on stored selection
    renderFromSelection();
  }

  widget.appendChild(arabicText);

  // Translation
  if (verseData.translation) {
    const translation = document.createElement("div");
    translation.className =
      "text-gray-300 text-sm font-light leading-relaxed max-w-4xl";
    translation.innerText = verseData.translation;
    widget.appendChild(translation);
  }

  widget.appendChild(reference);

  return widget;
}

// Expose to window
async function showQuranWidget(verseData) {
  const div =
    document.querySelector(".App")?.children[3]?.children[0]?.children[0];
  if (!div) return;

  const { quran: storedQuran } = await chrome.storage.local.get("quran");
  const myWidget = createQuranWidget(verseData, storedQuran);
  div.after(myWidget);
}
