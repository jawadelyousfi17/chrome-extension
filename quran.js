function displayQuranVerse(verseData) {
  // Remove existing widget if any
  const existing = document.getElementById("extension-quran-widget");
  if (existing) existing.remove();

  // Inject Arabic Font (Amiri)
  if (!document.getElementById("quran-font")) {
    const fontLink = document.createElement("link");
    fontLink.id = "quran-font";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);
  }

  // Create Overlay
  const overlay = document.createElement("div");
  overlay.id = "extension-quran-widget";
  overlay.className =
    "fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300";

  // Create Card
  const card = document.createElement("div");
  card.className =
    "bg-[#1F212A] border border-[#4E5567] p-10 max-w-3xl w-full mx-6 shadow-2xl transform scale-95 transition-all duration-300 relative flex flex-col items-center text-center gap-8";

  // Close Button
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
  closeBtn.className =
    "absolute top-4 right-4 text-[#4E5567] hover:text-white transition-colors duration-200";
  closeBtn.onclick = () => {
    overlay.classList.remove("opacity-100");
    card.classList.remove("scale-100");
    setTimeout(() => overlay.remove(), 300);
  };

  // Decorative Element (Top)
  const decoration = document.createElement("div");
  decoration.className = "text-[#4E5567] opacity-50 text-2xl";
  decoration.innerHTML = "۞";

  // Arabic Text
  const arabicText = document.createElement("div");
  arabicText.className =
    "text-white text-4xl md:text-5xl leading-[1.8] font-bold dir-rtl";
  arabicText.style.fontFamily = "'Amiri', serif";
  arabicText.style.direction = "rtl";
  arabicText.innerText = verseData.arabic || verseData; // Handle object or string

  // Translation
  const translationText = document.createElement("div");
  if (verseData.translation) {
    translationText.className =
      "text-gray-300 text-lg md:text-xl font-light leading-relaxed max-w-2xl";
    translationText.innerText = verseData.translation;
  }

  // Reference/Surah
  const reference = document.createElement("div");
  if (verseData.reference) {
    reference.className =
      "mt-2 px-4 py-1 border border-[#4E5567] text-[#4E5567] text-xs font-bold uppercase tracking-[0.2em]";
    reference.innerText = verseData.reference;
  }

  // Append Elements
  card.appendChild(closeBtn);
  card.appendChild(decoration);
  card.appendChild(arabicText);
  if (verseData.translation) card.appendChild(translationText);
  if (verseData.reference) card.appendChild(reference);

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // Animate In
  requestAnimationFrame(() => {
    overlay.classList.add("opacity-100");
    card.classList.add("scale-100");
  });

  // Close on click outside
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeBtn.click();
  });
}

// Example usage exposed to window for testing/calling from other scripts
window.displayQuranVerse = displayQuranVerse;
