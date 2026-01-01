function stickyNote() {
  // Prevent duplicate notes
  // if (document.getElementById("extension-sticky-note")) return;
  // const container = document.createElement("div");
  // container.id = "extension-sticky-note";
  // // Modern glassmorphism design
  // container.className =
  //   "fixed bottom-6 right-6 w-80 bg-[#1F212A]/95 backdrop-blur-md border border-[#343946] rounded-xl shadow-2xl z-[9999] flex flex-col transition-all duration-300 ease-out font-sans overflow-hidden ring-1 ring-white/5";
  // // Header
  // const header = document.createElement("div");
  // header.className =
  //   "flex justify-between items-center px-4 py-3 bg-[#2A2D3A]/50 border-b border-[#343946] cursor-move select-none group";
  // const title = document.createElement("div");
  // title.className =
  //   "flex items-center gap-2.5 opacity-90 group-hover:opacity-100 transition-opacity";
  // title.innerHTML = `
  //   <div class="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]"></div>
  //   <span class="text-xs font-bold text-gray-300 uppercase tracking-widest">Quick Note</span>
  // `;
  // const controls = document.createElement("div");
  // controls.className = "flex items-center gap-1.5";
  // const btnClass =
  //   "p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#343946] transition-all duration-200 focus:outline-none active:scale-95";
  // // Minimize Button
  // const minBtn = document.createElement("button");
  // minBtn.className = btnClass;
  // minBtn.title = "Minimize";
  // // Close Button
  // const closeBtn = document.createElement("button");
  // closeBtn.className = btnClass + " hover:bg-red-500/10 hover:text-red-400";
  // closeBtn.title = "Close";
  // closeBtn.innerHTML = `
  //   <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
  //   </svg>
  // `;
  // controls.appendChild(minBtn);
  // controls.appendChild(closeBtn);
  // header.appendChild(title);
  // header.appendChild(controls);
  // // Content Area
  // const textarea = document.createElement("textarea");
  // textarea.className =
  //   "w-full h-64 bg-transparent text-gray-200 p-4 text-sm resize-none focus:outline-none placeholder-gray-600 leading-relaxed scrollbar-thin scrollbar-thumb-[#343946] scrollbar-track-transparent";
  // textarea.placeholder = "Type something...";
  // textarea.spellcheck = false;
  // // Load saved content
  // chrome.storage.local.get(["sticky_note_content"], (result) => {
  //   if (result.sticky_note_content) {
  //     textarea.value = result.sticky_note_content;
  //   }
  // });
  // // Save content on input
  // textarea.addEventListener("input", (e) => {
  //   chrome.storage.local.set({ sticky_note_content: e.target.value });
  // });
  // container.appendChild(header);
  // container.appendChild(textarea);
  // document.body.appendChild(container);
  // // Minimize Logic
  // let isMinimized = true;
  // // Initial minimized state
  // textarea.style.display = "none";
  // container.style.width = "auto";
  // container.classList.add("rounded-full"); // Make it pill-shaped when minimized
  // header.classList.add("border-none", "bg-[#1F212A]", "px-5"); // Adjust header for pill shape
  // title.querySelector("span").textContent = "Notes"; // Shorten text
  // minBtn.innerHTML = `
  //   <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h16v16H4z"></path>
  //   </svg>
  // `;
  // minBtn.addEventListener("click", () => {
  //   isMinimized = !isMinimized;
  //   if (isMinimized) {
  //     textarea.style.display = "none";
  //     container.style.width = "auto";
  //     container.classList.add("rounded-full");
  //     header.classList.add("border-none", "bg-[#1F212A]", "px-5");
  //     header.classList.remove("bg-[#2A2D3A]/50", "px-4");
  //     title.querySelector("span").textContent = "Notes";
  //     minBtn.innerHTML = `
  //       <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h16v16H4z"></path>
  //       </svg>
  //     `;
  //   } else {
  //     textarea.style.display = "block";
  //     container.style.width = "20rem"; // w-80
  //     container.classList.remove("rounded-full");
  //     header.classList.remove("border-none", "bg-[#1F212A]", "px-5");
  //     header.classList.add("bg-[#2A2D3A]/50", "px-4");
  //     title.querySelector("span").textContent = "Quick Note";
  //     minBtn.innerHTML = `
  //       <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
  //       </svg>
  //     `;
  //   }
  // });
  // // Close Logic
  // closeBtn.addEventListener("click", () => {
  //   container.style.opacity = "0";
  //   container.style.transform = "scale(0.9)";
  //   setTimeout(() => container.remove(), 300);
  // });
}

// Make it available globally
window.stickyNote = stickyNote;
