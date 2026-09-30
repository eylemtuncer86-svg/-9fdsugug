const ADMIN_PASSWORD = "20170707";
const MEDIA_KEY = "ruzgarin-legolari-media";
const VISITOR_KEY = "ruzgarin-legolari-visitors";
const VISITOR_SEEN_KEY = "ruzgarin-legolari-visited-this-browser";

const gallery = document.querySelector("#gallery");
const emptyGallery = document.querySelector("#emptyGallery");
const visitorGate = document.querySelector("#visitorGate");
const visitorForm = document.querySelector("#visitorForm");
const skipVisitor = document.querySelector("#skipVisitor");
const adminDialog = document.querySelector("#adminDialog");
const adminOpen = document.querySelector("#adminOpen");
const adminClose = document.querySelector("#adminClose");
const panelClose = document.querySelector("#panelClose");
const adminLogin = document.querySelector("#adminLogin");
const adminPanel = document.querySelector("#adminPanel");
const loginError = document.querySelector("#loginError");
const uploadForm = document.querySelector("#uploadForm");
const visitorList = document.querySelector("#visitorList");
const adminMediaList = document.querySelector("#adminMediaList");
const clearVisitors = document.querySelector("#clearVisitors");

const readStore = (key) => JSON.parse(localStorage.getItem(key) || "[]");
const writeStore = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#039;",
}[character]));

function showVisitorGateIfNeeded() {
  if (sessionStorage.getItem(VISITOR_SEEN_KEY)) {
    visitorGate.classList.add("hidden");
  }
}

function recordVisitor(name = "Adsız ziyaretçi") {
  const visitors = readStore(VISITOR_KEY);
  visitors.unshift({
    name: name.trim() || "Adsız ziyaretçi",
    date: new Date().toLocaleString("tr-TR"),
    device: navigator.userAgent.includes("Mobile") ? "Mobil" : "Bilgisayar",
  });
  writeStore(VISITOR_KEY, visitors.slice(0, 100));
  sessionStorage.setItem(VISITOR_SEEN_KEY, "true");
  visitorGate.classList.add("hidden");
  renderVisitors();
}

function renderGallery() {
  const media = readStore(MEDIA_KEY);
  gallery.innerHTML = "";
  emptyGallery.hidden = media.length > 0;

  media.forEach((item) => {
    const card = document.createElement("article");
    card.className = "media-card";
    const mediaElement = item.type.startsWith("video") ? document.createElement("video") : document.createElement("img");
    mediaElement.src = item.src;
    mediaElement.alt = item.title;
    if (mediaElement.tagName === "VIDEO") mediaElement.controls = true;
    card.append(mediaElement);
    card.insertAdjacentHTML("beforeend", `<h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.date)}</p>`);
    gallery.append(card);
  });
}

function renderVisitors() {
  const visitors = readStore(VISITOR_KEY);
  visitorList.innerHTML = visitors.length ? "" : "<p>Henüz ziyaretçi kaydı yok.</p>";
  visitors.forEach((visitor) => {
    visitorList.insertAdjacentHTML("beforeend", `<div class="admin-row"><strong>${escapeHtml(visitor.name)}</strong><br><small>${escapeHtml(visitor.date)} • ${escapeHtml(visitor.device)}</small></div>`);
  });
}

function renderAdminMedia() {
  const media = readStore(MEDIA_KEY);
  adminMediaList.innerHTML = media.length ? "" : "<p>Henüz medya yüklenmedi.</p>";
  media.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "admin-row";
    row.innerHTML = `<strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.date)}</small>`;
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger";
    deleteButton.textContent = "Sil";
    deleteButton.addEventListener("click", () => {
      const nextMedia = readStore(MEDIA_KEY).filter((_, itemIndex) => itemIndex !== index);
      writeStore(MEDIA_KEY, nextMedia);
      renderGallery();
      renderAdminMedia();
    });
    row.append(deleteButton);
    adminMediaList.append(row);
  });
}

visitorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  recordVisitor(new FormData(visitorForm).get("visitorName"));
});
skipVisitor.addEventListener("click", () => recordVisitor());

adminOpen.addEventListener("click", () => adminDialog.showModal());
adminClose.addEventListener("click", () => adminDialog.close());
panelClose.addEventListener("click", () => adminDialog.close());

adminLogin.addEventListener("submit", (event) => {
  event.preventDefault();
  if (document.querySelector("#password").value === ADMIN_PASSWORD) {
    adminLogin.hidden = true;
    adminPanel.hidden = false;
    loginError.textContent = "";
    renderVisitors();
    renderAdminMedia();
    return;
  }
  loginError.textContent = "Şifre yanlış. Tekrar dene.";
});

uploadForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const file = document.querySelector("#legoFile").files[0];
  const title = document.querySelector("#legoTitle").value.trim();
  if (!file || !title) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const media = readStore(MEDIA_KEY);
    media.unshift({ title, type: file.type, src: reader.result, date: new Date().toLocaleDateString("tr-TR") });
    writeStore(MEDIA_KEY, media);
    uploadForm.reset();
    renderGallery();
    renderAdminMedia();
  });
  reader.readAsDataURL(file);
});

clearVisitors.addEventListener("click", () => {
  writeStore(VISITOR_KEY, []);
  renderVisitors();
});

showVisitorGateIfNeeded();
renderGallery();
renderVisitors();
renderAdminMedia();
