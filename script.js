const ageBtn = document.getElementById("ageBtn");
const typeBtn = document.getElementById("typeBtn");
const eligibilityBtn = document.getElementById("eligibilityBtn");
const learnBtn = document.getElementById("learnBtn");
const searchInput = document.getElementById("searchInput");
const opportunitiesScroll = document.querySelector(".opportunities-scroll");
const cards = Array.from(document.querySelectorAll(".card"));

ageBtn.onclick = (event) => {
    event.preventDefault();
    alert("Age Group clicked");
};

typeBtn.onclick = (event) => {
    event.preventDefault();
    alert("Types of Volunteering clicked");
};

eligibilityBtn.onclick = (event) => {
    event.preventDefault();
    alert("Eligibility clicked");
};

learnBtn.onclick = (event) => {
    event.preventDefault();
    alert("Learn More clicked");
};

if (opportunitiesScroll) {
    opportunitiesScroll.onwheel = (event) => {
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            event.preventDefault();
            opportunitiesScroll.scrollLeft -= event.deltaY;
        }
    };
}

const filterCards = () => {
    const query = searchInput.value.trim().toLowerCase();

    cards.forEach((card) => {
        const searchableText = card.dataset.search || "";
        const matches = searchableText.includes(query);
        card.classList.toggle("hidden", !matches && query !== "");
    });
};

if (searchInput) {
    searchInput.oninput = () => {
        filterCards();
    };

    searchInput.onkeydown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            filterCards();
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth"
            });
        }
    };
}
