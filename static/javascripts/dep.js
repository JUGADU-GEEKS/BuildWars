document.addEventListener("DOMContentLoaded", function () {
    const queryInput = document.getElementById("query");
    const departmentInput = document.getElementById("department");

    queryInput.addEventListener("input", async function () {
        const queryText = queryInput.value.trim();
        if (queryText.length > 10) {  // Avoid sending too many requests
            try {
                const response = await fetch("/predict-department", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ query: queryText })
                });

                const data = await response.json();
                departmentInput.value = data.department || "Not Found";
            } catch (error) {
                console.error("Error predicting department:", error);
                departmentInput.value = "Error predicting";
            }
        } else {
            departmentInput.value = "Will be generated Automatically";
        }
    });
});
