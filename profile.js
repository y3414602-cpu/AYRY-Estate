// ── Guard: لو مش مسجل دخول يرجع للوجين ──
window.onload = function () {
  if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "LoginPage.html";
    return;
  }
  loadUser();
};

// ── Helpers ──
function getUser()  { return JSON.parse(localStorage.getItem("currentUser")); }
function getUsers() { return JSON.parse(localStorage.getItem("users")) || []; }

function saveToStorage(users, user) {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(user));
}

// ── Load User Data in UI ──
function loadUser() {
  const u = getUser();
  document.getElementById("dispName").innerText   = u.name;
  document.getElementById("dispEmail").innerText  = u.email;
  document.getElementById("infoName").innerText   = u.name;
  document.getElementById("infoEmail").innerText  = u.email;
  document.getElementById("infoPhone").innerText  = u.phone || "—";
  document.getElementById("infoJoined").innerText = u.joined || new Date().getFullYear();

  document.getElementById("editName").value  = u.name;
  document.getElementById("editPhone").value = u.phone || "";
  document.getElementById("editEmail").value = u.email;
}

// ── Toggle Edit Sections ──
function toggleSection(id) {
  const form   = document.getElementById("form"   + id);
  const toggle = document.getElementById("toggle" + id);
  const isOpen = form.classList.contains("open");

  // أغلق كل الفورمز
  ["Info", "Email", "Pass"].forEach(s => {
    document.getElementById("form"   + s).classList.remove("open");
    document.getElementById("toggle" + s).classList.remove("active");
    document.getElementById("toggle" + s).innerHTML = '<i class="fa-solid fa-pen"></i> Edit';
  });

  // لو كان مقفول افتحه
  if (!isOpen) {
    form.classList.add("open");
    toggle.classList.add("active");
    toggle.innerHTML = '<i class="fa-solid fa-xmark"></i> Close';
  }
}

// ── Show Message ──
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.innerText = text;
  el.className = "form-msg " + type;
  setTimeout(() => { el.className = "form-msg"; el.innerText = ""; }, 3000);
}

// ── Save Personal Info ──
function saveInfo() {
  const name  = document.getElementById("editName").value.trim();
  const phone = document.getElementById("editPhone").value.trim();

  if (!name) { showMsg("msgInfo", "Name cannot be empty", "error"); return; }

  const user  = getUser();
  const users = getUsers();
  const idx   = users.findIndex(u => u.email === user.email);

  user.name  = name;
  user.phone = phone;
  if (idx !== -1) users[idx] = user;

  saveToStorage(users, user);
  loadUser();
  showMsg("msgInfo", "Info updated successfully ✅", "success");
  setTimeout(() => toggleSection("Info"), 1500);
}

// ── Save Email ──
function saveEmail() {
  const newEmail = document.getElementById("editEmail").value.trim();
  const pass     = document.getElementById("emailPass").value;

  if (!newEmail || !pass) { showMsg("msgEmail", "Please fill all fields", "error"); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { showMsg("msgEmail", "Invalid email format", "error"); return; }

  const user  = getUser();
  const users = getUsers();

  if (user.password !== pass) { showMsg("msgEmail", "Wrong password", "error"); return; }
  if (users.find(u => u.email === newEmail && u.email !== user.email)) {
    showMsg("msgEmail", "Email already in use", "error"); return;
  }

  const oldEmail = user.email;
  user.email = newEmail;
  const idx = users.findIndex(u => u.email === oldEmail);
  if (idx !== -1) users[idx] = user;

  saveToStorage(users, user);
  document.getElementById("emailPass").value = "";
  loadUser();
  showMsg("msgEmail", "Email updated successfully ✅", "success");
  setTimeout(() => toggleSection("Email"), 1500);
}

// ── Save Password ──
function savePassword() {
  const current = document.getElementById("currentPass").value;
  const newP    = document.getElementById("newPass").value;
  const confirm = document.getElementById("confirmPass").value;

  if (!current || !newP || !confirm) { showMsg("msgPass", "Please fill all fields", "error"); return; }

  const user  = getUser();
  const users = getUsers();

  if (user.password !== current) { showMsg("msgPass", "Current password is wrong", "error"); return; }
  if (newP !== confirm)           { showMsg("msgPass", "Passwords do not match", "error"); return; }
  if (newP.length < 6)            { showMsg("msgPass", "Minimum 6 characters", "error"); return; }

  const idx = users.findIndex(u => u.email === user.email);
  user.password = newP;
  if (idx !== -1) users[idx] = user;

  saveToStorage(users, user);
  ["currentPass", "newPass", "confirmPass"].forEach(id => document.getElementById(id).value = "");
  showMsg("msgPass", "Password updated successfully ✅", "success");
  setTimeout(() => toggleSection("Pass"), 1500);
}

// ── Logout ──
function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}
