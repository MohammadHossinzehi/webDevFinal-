fetch("/api/check-session")
  .then((res) => res.json())
  .then((data) => {
    if (!data.loggedIn && !window.location.pathname.includes("login.html")) {
      window.location.href = "/login.html";
    }
  });
