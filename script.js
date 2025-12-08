// ================= POPUP HANDLING ================= //
const loginPopup = document.getElementById("loginPopup");
const bookingPopup = document.getElementById("bookingPopup");

const openLogin = document.getElementById("openLogin");
const openBooking = document.getElementById("openBooking");

// Open Login Popup
openLogin && openLogin.addEventListener("click", () => {
  loginPopup.style.display = "flex";
});

// Open Booking Popup
openBooking && openBooking.addEventListener("click", () => {
  bookingPopup.style.display = "flex";
});

// Close Popups
const closeButtons = document.querySelectorAll("[data-close]");
closeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    loginPopup.style.display = "none";
    bookingPopup.style.display = "none";
  });
});

// Close when clicking outside box
window.addEventListener("click", (e) => {
  if (e.target === loginPopup) loginPopup.style.display = "none";
  if (e.target === bookingPopup) bookingPopup.style.display = "none";
});

// ================= SCROLL ANIMATION ================= //
const revealElements = document.querySelectorAll(".service-card, .review-card, .hero-text, .hero-img");

function revealOnScroll() {
  const trigger = window.innerHeight * 0.85;

  revealElements.forEach((el) => {
    const top = el.getBoundingClientRect().top;
    if (top < trigger) {
      el.style.opacity = 1;
      el.style.transform = "translateY(0)";
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

// Initialize hidden state
revealElements.forEach((el) => {
  el.style.opacity = 0;
  el.style.transform = "translateY(40px)";
  el.style.transition = "0.6s ease";
});

// ================= TOAST NOTIFICATION ================= //
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = 1;
    toast.style.transform = "translateY(0)";
  }, 100);

  setTimeout(() => {
    toast.style.opacity = 0;
    toast.style.transform = "translateY(20px)";
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// Example: show toast when booking is confirmed
// Booking submit now posts to backend and displays returned bookingId
const bookingBtn = document.getElementById("confirmBookingBtn");
if (bookingBtn) {
  bookingBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    // collect values
    const name = document.getElementById("bName").value.trim();
    const phone = document.getElementById("bPhone").value.trim();
    const device = document.getElementById("bDevice").value;
    const model = document.getElementById("bModel").value.trim();
    const issue = document.getElementById("bIssue").value;
    const address = document.getElementById("bAddress").value.trim();
    const datetime = document.getElementById("bDatetime").value;

    if (!name || !phone || !device || !issue || !address || !datetime) {
      showToast("Please fill all booking fields.");
      return;
    }

    const payload = { name, phone, device, model, service: issue, address, datetime };

    try {
      const res = await fetch("https://backendwithapi.onrender.com/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok) {
        const id = result.bookingId || (result.booking && result.booking.bookingId) || "N/A";
        showToast(`Booking Confirmed! Your ID: ${id}`);
        bookingPopup.style.display = "none";
        // reset popup inputs
        document.getElementById("bName").value = "";
        document.getElementById("bPhone").value = "";
        document.getElementById("bDevice").value = "";
        document.getElementById("bModel").value = "";
        document.getElementById("bIssue").value = "";
        document.getElementById("bAddress").value = "";
        document.getElementById("bDatetime").value = "";
      } else {
        showToast(result.message || "Server error. Try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      showToast("Server error. Check your connection.");
    }
  });
}

// --- Responsive nav toggle ---
(function () {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (!menuToggle || !navLinks) return;

  // create overlay (so clicking outside closes menu)
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  function openMenu() {
    navLinks.classList.add('open');
    menuToggle.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
    overlay.classList.add('show');
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
    overlay.classList.remove('show');
  }

  menuToggle.addEventListener('click', function (e) {
    const isOpen = navLinks.classList.contains('open');
    if (isOpen) closeMenu(); else openMenu();
  });

  // close when clicking overlay or any nav link
  overlay.addEventListener('click', closeMenu);
  navLinks.addEventListener('click', function (e) {
    const target = e.target;
    if (target.tagName === 'A' || target.classList.contains('login-btn')) {
      closeMenu();
    }
  });

  // close on ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // On resize — if moving to wide screen ensure menu closed
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) closeMenu();
  });
})();

// ================= ADD REVIEW =================
const reviewForm = document.getElementById("reviewForm");
let reviewList = document.getElementById("reviewList");

if (reviewForm) {
  reviewForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("rName").value;
    const msg = document.getElementById("rMessage").value;

    // Create new review card
    const card = document.createElement("div");
    card.classList.add("review-card", "big", "new-review");

    card.innerHTML = `
      <div class="stars">★★★★★</div>
      <p>“${msg}”</p>
      <h4>- ${name}</h4>
    `;

    // ensure reviewList exists
    if (!reviewList) {
      reviewList = document.querySelector(".review-grid") || document.querySelector(".reviews .review-grid");
      if (reviewList) reviewList.id = "reviewList";
    }

    if (reviewList) reviewList.prepend(card);

    reviewForm.reset();
  });
}

// Robust review + star script
document.addEventListener("DOMContentLoaded", () => {
  console.log("Review script loaded.");

  // Helper: find or create reviewList container
  let reviewListLocal = document.getElementById("reviewList");
  if (!reviewListLocal) {
    reviewListLocal = document.querySelector(".review-grid") || document.querySelector(".reviews .review-grid");
    if (reviewListLocal) {
      reviewListLocal.id = "reviewList";
      console.warn("reviewList was missing — assigned id to existing .review-grid.");
    } else {
      const reviewsSection = document.querySelector(".reviews") || document.body;
      reviewListLocal = document.createElement("div");
      reviewListLocal.id = "reviewList";
      reviewListLocal.className = "review-grid big-review";
      reviewsSection.appendChild(reviewListLocal);
      console.warn("No .review-grid found — created #reviewList and appended to reviews section or body.");
    }
  }

  // Helper: find form or tell user what to add
  let reviewFormLocal = document.getElementById("reviewForm");
  if (!reviewFormLocal) {
    reviewFormLocal = document.querySelector("form.review-form") || document.querySelector("form");
    if (reviewFormLocal) {
      reviewFormLocal.id = "reviewForm";
      console.warn("reviewForm id was missing — assigned id to existing form.");
    } else {
      console.error("No review form found. Please add a form with id='reviewForm'.");
      return;
    }
  }

  // Find inputs
  const rName = document.getElementById("rName") || reviewFormLocal.querySelector("input[name='name']") || reviewFormLocal.querySelector("input[type='text']");
  const rMessage = document.getElementById("rMessage") || reviewFormLocal.querySelector("textarea[name='message']") || reviewFormLocal.querySelector("textarea");

  if (!rName || !rMessage) {
    console.error("Name or message fields not found. Ensure inputs are present and have id='rName' and id='rMessage' (or at least a text input and a textarea).");
    return;
  }

  // Find star container: support #starRating or .star-rating; create if absent
  let starContainer = document.getElementById("starRating") || document.querySelector(".star-rating");
  if (!starContainer) {
    starContainer = document.createElement("div");
    starContainer.className = "star-rating";
    starContainer.id = "starRating";
    rName.parentNode.insertBefore(starContainer, rName);
    console.warn("Star container not found — created #starRating above name input.");
  } else {
    if (!starContainer.id) starContainer.id = "starRating";
  }

  let stars = starContainer.querySelectorAll(".star");
  if (!stars || stars.length === 0) {
    starContainer.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
      const s = document.createElement("i");
      s.className = "star";
      s.setAttribute("data-value", String(i));
      s.setAttribute("role", "button");
      s.setAttribute("aria-label", `${i} star`);
      s.textContent = "★";
      starContainer.appendChild(s);
    }
    stars = starContainer.querySelectorAll(".star");
    console.log("Added 5 star elements to #starRating.");
  }

  let selectedRating = 0;
  function updateStarUI(rating) {
    stars.forEach((s) => {
      const val = parseInt(s.getAttribute("data-value"), 10);
      if (val <= rating) s.classList.add("selected");
      else s.classList.remove("selected");
    });
  }

  stars.forEach((star) => {
    star.style.cursor = "pointer";
    star.addEventListener("click", () => {
      selectedRating = parseInt(star.getAttribute("data-value"), 10);
      updateStarUI(selectedRating);
    });

    star.addEventListener("mouseover", () => {
      const hv = parseInt(star.getAttribute("data-value"), 10);
      updateStarUI(hv);
    });
    star.addEventListener("mouseout", () => {
      updateStarUI(selectedRating);
    });
  });

  // Submit handler (sends to backend)
  reviewFormLocal.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = (rName.value || "").trim();
    const message = (rMessage.value || "").trim();

    if (selectedRating === 0) {
      alert("Please select a star rating before submitting.");
      return;
    }
    if (!name || !message) {
      alert("Please enter your name and a review message.");
      return;
    }

    const payload = { name, rating: selectedRating, message };

    try {
      const res = await fetch("https://backendwithapi.onrender.com/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok) {
        // add to UI
        const newCard = document.createElement("div");
        newCard.className = "review-card big";
        newCard.style.borderLeft = "5px solid #18a51a";
        newCard.style.background = "white";
        newCard.style.borderRadius = "14px";
        newCard.style.padding = "18px";
        newCard.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
        newCard.style.marginBottom = "18px";
        const starText = "★".repeat(selectedRating);
        newCard.innerHTML = `
          <div class="stars" style="color:#ffb400; font-size:20px; margin-bottom:8px;">${starText}</div>
          <p style="margin:0 0 12px 0;">“${escapeHtml(message)}”</p>
          <h4 style="margin:0; font-weight:600;">- ${escapeHtml(name)}</h4>
        `;
        reviewListLocal.prepend(newCard);
        reviewFormLocal.reset();
        selectedRating = 0;
        updateStarUI(0);
        showToast("Thanks for your review!");
      } else {
        showToast(result.message || "Review failed");
      }
    } catch (err) {
      console.error("Review submit error:", err);
      showToast("Server error while adding review.");
    }
  });

  function escapeHtml(str) {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

}); // DOMContentLoaded end
