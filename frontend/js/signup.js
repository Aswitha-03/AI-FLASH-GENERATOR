document.addEventListener("DOMContentLoaded", () => {

    const signupForm = document.getElementById("signupForm");

    signupForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {

            const response = await fetch("https://ai-flash-generator.onrender.com/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {

                alert("✅ Signup Successful");

                window.location.href = "login.html";

            } else {

                alert(data.message || "❌ Signup Failed");
            }

        } catch (error) {

            console.error(error);
            alert("⚠️ Server Connection Error");
        }

    });

});
