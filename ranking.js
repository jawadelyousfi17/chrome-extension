async function showRanking() {
  // add ?tab=leaderboard
  const url = new URL(window.location);
  url.searchParams.set("tab", "leaderboard");
  window.history.pushState({}, "", url);

  const mainDiv = document.querySelector(".App").children[3];
  if (!mainDiv) return;
  mainDiv.innerHTML = "";
  // mainDiv.className = "flex flex-col gap-2 mt-32";
  mainDiv.classList.add("space-y-2");

  const showCenteredLoading = (message) => {
    mainDiv.innerHTML = "";
    const loading = document.createElement("div");
    loading.className =
      "flex flex-col items-center justify-center w-full min-h-[40vh]";
    loading.innerHTML = `
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#00babc]"></div>
      <div class="mt-3 text-sm text-gray-500">${message}</div>
    `;
    mainDiv.appendChild(loading);
  };

  await refreshToken();
  const { access_token } = await chrome.storage.local.get("access_token");

  const fetchUsersForYear = async (year, campusId) => {
    // If your backend supports it, it can read ?year=YYYY. If not, it will simply ignore.
    const url = year
      ? `https://improved-1337.vercel.app/api/getUsers?year=${year}&campusId=${campusId}`
      : "https://improved-1337.vercel.app/api/getUsers";
    console.log(url);
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return await response.json();
  };

  showCenteredLoading("Loading users…");

  let allData;
  try {
    // default year: 2024

    const userInfo = await fetchUserInfo();
    const poolYear = userInfo?.pool_year;
    campusId = userInfo.campus[0].id;

    allData = await fetchUsersForYear(parseInt(poolYear), campusId);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    mainDiv.innerHTML = `
      <div class="flex flex-col items-center justify-center w-full min-h-[40vh] text-gray-500">
        <div class="text-sm">Failed to load users.</div>
      </div>
    `;
    return;
  }

  mainDiv.innerHTML = "";

  // Controls (Year + Search)
  const controls = document.createElement("div");
  controls.className = "sticky top-20 z-10 mb-6";
  controls.innerHTML = `
    <div class="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
      <div class="sm:w-44">
        <select
          id="promoYear"
          class="w-full bg-white border border-gray-200 py-3 px-3 text-gray-900 focus:outline-none focus:border-[#00babc] focus:ring-1 focus:ring-[#00babc] transition-all shadow-sm"
        >
          <option value="">All promos</option>
          <option value="2019">2019</option>
          <option value="2020">2020</option>
          <option value="2021">2021</option>
          <option value="2022">2022</option>
          <option value="2023">2023</option>
          <option value="2024" selected>2024</option>
          <option value="2025">2025</option>
        </select>
      </div>

      <div class="relative flex-1">
        <input
          type="text"
          id="userSearch"
          placeholder="Search by name or login..."
          class="w-full bg-white border border-gray-200 py-3 px-4 pl-11 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00babc] focus:ring-1 focus:ring-[#00babc] transition-all shadow-sm"
        />
        <svg class="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
    </div>
  `;
  mainDiv.appendChild(controls);

  const cardsContainer = document.createElement("div");
  cardsContainer.className = "space-y-2 px-8";
  mainDiv.appendChild(cardsContainer);

  const showInlineLoading = (message) => {
    cardsContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center w-full min-h-[30vh]">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#00babc]"></div>
        <div class="mt-3 text-sm text-gray-500">${message}</div>
      </div>
    `;
  };

  const renderUsers = (users) => {
    cardsContainer.innerHTML = "";
    users.forEach((user) => {
      cardsContainer.appendChild(
        createUserCard(
          user.avatar,
          user.login,
          user.level,
          user.name,
          user.rank
        )
      );
    });
  };

  let currentData = allData;

  const applyFiltersAndRender = () => {
    if (!currentData || !currentData.users) return;

    const searchTerm = (document.getElementById("userSearch").value || "")
      .toLowerCase()
      .trim();
    const selectedYear = document.getElementById("promoYear").value;

    let users = currentData.users;

    if (searchTerm) {
      users = users.filter(
        (u) =>
          String(u.name || "")
            .toLowerCase()
            .includes(searchTerm) ||
          String(u.login || "")
            .toLowerCase()
            .includes(searchTerm)
      );
    }

    renderUsers(users);
  };

  // Initial render
  applyFiltersAndRender();

  // Search functionality
  const searchInput = document.getElementById("userSearch");
  searchInput.addEventListener("input", applyFiltersAndRender);

  // Year/promo change
  const promoYear = document.getElementById("promoYear");
  promoYear.addEventListener("change", async (e) => {
    const year = e.target.value;
    showInlineLoading("Loading users…");
    try {
      currentData = await fetchUsersForYear(year ? Number(year) : "", campusId);
    } catch (error) {
      console.error("Failed to fetch users for year:", error);
      cardsContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center w-full min-h-[30vh] text-gray-500">
          <div class="text-sm">Failed to load users.</div>
        </div>
      `;
      return;
    }
    applyFiltersAndRender();
  });
}

function createUserCard(avatar, login, level, name, rank) {
  const userCard = document.createElement("a");
  userCard.href = `https://profile-v3.intra.42.fr/users/${login}`;
  userCard.className =
    "group flex flex-col w-full bg-white border border-gray-200 transition-all duration-300 overflow-hidden cursor-pointer";

  userCard.innerHTML = `
    <div class="p-4 flex items-center gap-3">
      <div class="shrink-0">
        <img 
          src="${avatar}" 
          alt="${name}" 
          class="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
        >
      </div>
      
      <div class="flex-1 min-w-0">
        <h2 class="text-lg font-bold text-gray-900 truncate leading-tight group-hover:text-[#00babc] transition-colors">
          ${name}
        </h2>
        <p class="text-sm text-gray-500 font-medium truncate">@${login}</p>
      </div>
    </div>

    <div class="bg-gray-50 border-t border-gray-200 grid grid-cols-2 divide-x divide-gray-200">
      
      <div class="py-2 flex items-center justify-center gap-2 hover:bg-white transition-colors">
        <span class="text-xs uppercase font-bold text-gray-400">Rank</span>
        <span class="text-base font-bold text-gray-800">#${rank}</span>
      </div>

      <div class="py-2 flex items-center justify-center gap-2 hover:bg-white transition-colors">
        <span class="text-xs uppercase font-bold text-gray-400">Level</span>
        <span class="text-base font-bold text-[#00babc]">${level.toFixed(
          2
        )}</span>
      </div>

    </div>
`;
  return userCard;
}
