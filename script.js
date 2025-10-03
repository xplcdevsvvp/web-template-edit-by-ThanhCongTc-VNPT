// Toggle dark mode
const toggleBtn = document.querySelector(".dark-toggle");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Simple form validation
document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm.");
});
