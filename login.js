// Switch Forms
function showLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
  document.querySelector(".tab-btn:nth-child(1)").classList.add("active");
  document.querySelector(".tab-btn:nth-child(2)").classList.remove("active");
  clearMsg();
}

function showRegister() {
  document.getElementById("registerForm").style.display = "block";
  document.getElementById("loginForm").style.display = "none";
  document.querySelector(".tab-btn:nth-child(2)").classList.add("active");
  document.querySelector(".tab-btn:nth-child(1)").classList.remove("active");
  clearMsg();
}
// Messages
function showMsg(text, type) {
  let el = document.getElementById("error");
  el.innerText = text;
  el.className = "message " + type;
}

function clearMsg() {
  let el = document.getElementById("error");
  el.innerText = "";
  el.className = "message";
}

// Email Validation
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Register
function register() {
  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let phone = document.getElementById("phone").value;
  let password = document.getElementById("password").value;
  let confirmPassword = document.getElementById("confirmPassword").value;

  if (!name || !email || !password || !confirmPassword) {
    showMsg("Please fill all required fields", "error");
    return;
  }

  if (!validateEmail(email)) {
    showMsg("Invalid email format", "error");
    return;
  }

  let phonePattern = /^01[0125][0-9]{8}$/;
  if (phone && !phonePattern.test(phone)) {
    showMsg("Please enter a valid Egyptian phone number (11 digits)", "error");
    return;
  }

  if (!/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/.test(password)) {
    showMsg("Password must be at least 8 characters and include letters and numbers", "error");
    return;
  }

  if (password !== confirmPassword) {
    showMsg("Passwords do not match", "error");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  let emailExists = users.find(u => u.email === email);
  if (emailExists) {
    showMsg("Email already registered!", "error");
    return;
  }

  let newUser = { name, email, phone, password };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  showMsg("Account created successfully 🎉", "success");
  setTimeout(() => { showLogin(); }, 1000);
}

// Login
function login() {
  let email = document.getElementById("loginEmail").value;
  let password = document.getElementById("loginPassword").value;

  let users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.length === 0) {
    showMsg("No account found, please register", "error");
    return;
  }

  let foundUser = users.find(u => u.email === email && u.password === password);

  if (foundUser) {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUser", JSON.stringify(foundUser));
    showMsg("Login successful 🚀", "success");
    setTimeout(() => { window.location.href = "index.html"; }, 1000);
  } else {
    showMsg("Wrong email or password", "error");
  }
}

// لو اليوزر مسجل دخول خالص مش محتاج يفتح اللوجين
window.onload = function () {
  if (localStorage.getItem("isLoggedIn") === "true") {
    window.location.href = "index.html";
  }
};
