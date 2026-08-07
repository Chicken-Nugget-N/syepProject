document.getElementById("ageBtn").addEventListener("click", function (e) {
    e.preventDefault();
    alert("Age Group clicked");
});

document.getElementById("typeBtn").addEventListener("click", function (e) {
    e.preventDefault();
    alert("Types of Volunteering clicked");
});

document.getElementById("eligibilityBtn").addEventListener("click", function (e) {
    e.preventDefault();
    alert("Eligibility clicked");
});

document.getElementById("learnBtn").addEventListener("click", function (e) {
    e.preventDefault();
    alert("Learn More clicked");
});

const opportunitiesScroll = document.querySelector(".opportunities-scroll");

if (opportunitiesScroll) {
    opportunitiesScroll.addEventListener("wheel", function (e) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            opportunitiesScroll.scrollLeft -= e.deltaY;
        }
    }, { passive: false });
}
