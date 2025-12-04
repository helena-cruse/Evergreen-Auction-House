import { loginUser } from "./auth.js";

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");
const messageEl = document.getElementById("login-message");
const submitBtn = document.getElementById("login-btn");

function setMessage(text, isError = false) {
  if (!messageEl) return;
  messageEl.textContent = text;
  messageEl.className =
    "min-h-[1.25rem] text-xs text-center mt-1 " +
    (isError ? "text-red-800" : "text-green-800");
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email.trim() || !password.trim()) {
      setMessage("Please fill in both fields.", true);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";
    setMessage("");

    try {
      await loginUser({ email, password });
      setMessage("Logged in successfully!");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 900);
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.message || "Login failed.", true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Log in";
    }
  });
}
