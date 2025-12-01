// js/register.js

const NOROFF_API_BASE = "https://v2.api.noroff.dev";

const form = document.getElementById("registerForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const messageEl = document.getElementById("registerMessage");

/**
 * Enkel validering i henhold til Noroff v2-register:
 * - name: ingen spesialtegn (kun bokstaver/tall/underscore)
 * - email: må slutte på @stud.noroff.no
 * - password: min 8 tegn
 * - confirm: må matche
 */
function validateForm() {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Name
  const nameRegex = /^[A-Za-z0-9_]+$/;
  if (!nameRegex.test(name)) {
    showMessage(
      "Name can only contain letters, numbers and underscore (_).",
      true
    );
    return false;
  }

  // Email (kun stud.noroff.no som i brief)
  if (!email.endsWith("@stud.noroff.no")) {
    showMessage("Email must end with @stud.noroff.no.", true);
    return false;
  }

  // Password length
  if (password.length < 8) {
    showMessage("Password must be at least 8 characters.", true);
    return false;
  }

  // Confirm password
  if (password !== confirmPassword) {
    showMessage("Passwords do not match.", true);
    return false;
  }

  return { name, email, password };
}

function showMessage(text, isError = false) {
  if (!messageEl) return;
  messageEl.textContent = text;
  messageEl.className =
    "min-h-[1.25rem] text-xs text-center mt-1 " +
    (isError ? "text-red-900" : "text-evergreenDark");
}

async function handleRegisterSubmit(event) {
  event.preventDefault();

  const validated = validateForm();
  if (!validated) return;

  const { name, email, password } = validated;

  showMessage("Creating account...", false);

  try {
    const response = await fetch(`${NOROFF_API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const apiError =
        data?.errors?.[0]?.message ||
        data?.message ||
        "Registration failed. Please check your details and try again.";
      showMessage(apiError, true);
      return;
    }

    showMessage("Account created successfully! Redirecting to login...", false);
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);
  } catch (error) {
    console.error(error);
    showMessage(
      "Something went wrong while creating your account. Please try again.",
      true
    );
  }
}

if (form) {
  form.addEventListener("submit", handleRegisterSubmit);
}
