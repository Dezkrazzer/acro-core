// Dropdown functionality for desktop
const dropdownButton = document.getElementById("dropdown-button");
const dropdownMenu = document.getElementById("dropdown-menu");

dropdownButton.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle("hidden");
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!dropdownButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
    dropdownMenu.classList.add("hidden");
  }
});

// Mobile menu functionality
const mobileMenuButton = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");
const hamburger = document.querySelector(".hamburger");

mobileMenuButton.addEventListener("click", (e) => {
  e.stopPropagation();
  mobileMenu.classList.toggle("open");
  hamburger.classList.toggle("open");
});

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
  if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
    mobileMenu.classList.remove("open");
    hamburger.classList.remove("open");
  }
});

// Mobile dropdown functionality
const mobileDropdownButton = document.getElementById("mobile-dropdown-button");
const mobileDropdownMenu = document.getElementById("mobile-dropdown-menu");

mobileDropdownButton.addEventListener("click", (e) => {
  e.stopPropagation();
  mobileDropdownMenu.classList.toggle("hidden");
});
