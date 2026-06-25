document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {

            const response = await fetch("https://ai-flash-generator.onrender.com/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {

                localStorage.setItem("email", email);

                alert("✅ Login Successful");

                window.location.href = "index.html";

            } else {

                alert(data.message || "❌ Invalid Email or Password");
            }

        } catch (error) {

            console.error(error);
            alert("⚠️ Server Connection Error");
        }

    });

});
