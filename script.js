const ageBtn = document.getElementById("ageBtn");
const typeBtn = document.getElementById("typeBtn");
const eligibilityBtn = document.getElementById("eligibilityBtn");
const learnBtn = document.getElementById("learnBtn");

const searchInput = document.getElementById("searchInput");

const homeScreen = document.getElementById("homeScreen");
const mainNav = document.getElementById("mainNav");

const resultsScreen = document.getElementById("resultsScreen");
const resultsContainer = document.getElementById("resultsContainer");

const resultsTitle = document.getElementById("resultsTitle");
const resultsDescription = document.getElementById("resultsDescription");

const filterOptions = document.getElementById("filterOptions");

const loading = document.getElementById("loading");
const noResults = document.getElementById("noResults");

const backBtn = document.getElementById("backBtn");

const opportunitiesScroll =
    document.querySelector(".opportunities-scroll");

const localCards =
    Array.from(document.querySelectorAll(".card"));

/*
====================================================
NYC OPEN DATA API
====================================================

Dataset:
Volunteer Opportunities and Finding Organizations

Dataset ID:
shpd-5q9m
*/

const API_URL =
    "https://data.cityofnewyork.us/resource/shpd-5q9m.json?$limit=100";


/*
====================================================
SHOW RESULTS SCREEN
====================================================
*/

function showResultsScreen(title, description) {

    homeScreen.classList.add("hidden");
    mainNav.classList.add("hidden");

    resultsScreen.classList.add("active");

    resultsTitle.textContent = title;
    resultsDescription.textContent = description;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/*
====================================================
BACK TO HOME
====================================================
*/

function showHomeScreen() {

    resultsScreen.classList.remove("active");

    homeScreen.classList.remove("hidden");
    mainNav.classList.remove("hidden");

    resultsContainer.innerHTML = "";
    filterOptions.innerHTML = "";

    loading.classList.remove("active");
    noResults.classList.remove("active");

    searchInput.value = "";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

backBtn.onclick = showHomeScreen;


/*
====================================================
LOADING
====================================================
*/

function showLoading() {

    loading.classList.add("active");
    noResults.classList.remove("active");

}

function hideLoading() {

    loading.classList.remove("active");

}


/*
====================================================
ESCAPE HTML
====================================================

Prevents API text from being inserted directly
as HTML.
*/

function escapeHTML(value) {

    if (!value) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/*
====================================================
CREATE RESULT CARD
====================================================
*/

function createResultCard(opportunity, number) {

    const title =
        opportunity.title ||
        opportunity.name ||
        opportunity.opportunity ||
        "Volunteer Opportunity";

    const organization =
        opportunity.organization ||
        opportunity.organization_name ||
        opportunity.org_name ||
        "Community Organization";

    const description =
        opportunity.description ||
        opportunity.details ||
        "Volunteer and make a difference in your community.";

    const location =
        opportunity.location ||
        opportunity.address ||
        opportunity.borough ||
        "New York City";


    /*
    ==========================================
    FIND A VALID LINK
    ==========================================
    */

    let url =
        opportunity.url ||
        opportunity.website ||
        opportunity.link ||
        "";


    /*
    Make sure the URL actually starts with
    http:// or https://
    */

    if (
        !url ||
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ) {

        url = "https://www.nycservice.org/";

    }


    /*
    ==========================================
    CREATE CARD
    ==========================================
    */

    const card = document.createElement("article");

    card.className = "result-card";

    card.innerHTML = `

        <div>

            <span class="result-number">
                ${String(number).padStart(2, "0")}
            </span>

            <h2>
                ${escapeHTML(title)}
            </h2>

            <h3>
                ${escapeHTML(organization)}
            </h3>

            <p>
                ${escapeHTML(description)}
            </p>

            <div class="result-info">
                📍 ${escapeHTML(location)}
            </div>

        </div>

        <a
            class="result-link"
            href="${escapeHTML(url)}"
            target="_blank"
            rel="noopener noreferrer"
        >
            VIEW OPPORTUNITY →
        </a>

    `;

    return card;
}

/*
====================================================
DISPLAY RESULTS
====================================================
*/

function displayResults(results) {

    resultsContainer.innerHTML = "";

    if (!results || results.length === 0) {

        noResults.classList.add("active");

        return;
    }

    noResults.classList.remove("active");

    results.forEach((opportunity, index) => {

        const card =
            createResultCard(opportunity, index + 1);

        resultsContainer.appendChild(card);

    });
}


/*
====================================================
GET DATA FROM NYC API
====================================================
*/

async function getVolunteerData(searchTerm = "") {

    showLoading();

    try {

        let url = API_URL;

        if (searchTerm.trim() !== "") {

            const encoded =
                encodeURIComponent(
                    searchTerm.trim().toLowerCase()
                );

            /*
             * Socrata can search the entire dataset using
             * the $q parameter.
             */

            url =
                `https://data.cityofnewyork.us/resource/shpd-5q9m.json?$q=${encoded}&$limit=100`;
        }

        const response =
            await fetch(url);

        if (!response.ok) {
            throw new Error(
                `API request failed: ${response.status}`
            );
        }

        const data =
            await response.json();

        hideLoading();

        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        console.error(
            "Volunteer API error:",
            error
        );

        hideLoading();

        return [];

    }
}


/*
====================================================
SEARCH
====================================================
*/

async function performSearch(query) {

    const searchTerm = query.trim().toLowerCase();

    if (!searchTerm) {
        return;
    }

    showResultsScreen(
        `Search Results: "${query}"`,
        "Please note some links may be suspicious or unverified. Research links before providing personal information."
    );

    resultsContainer.innerHTML = "";

    // Keeps track of organizations/opportunities
    // that have already been displayed
    const seen = new Set();

    let resultNumber = 1;


    /*
    ==========================================
    SEARCH LOCAL CARDS
    ==========================================
    */

    const localMatches = localCards.filter(card => {

        const text = card.dataset.search || "";

        return text
            .toLowerCase()
            .includes(searchTerm);

    });


    localMatches.forEach(card => {

        const image = card.querySelector("img");

        const title =
            image?.alt ||
            "Volunteer Organization";

        // Convert name to lowercase so
        // "City Harvest" and "city harvest"
        // count as the same thing.
        const uniqueName = title
            .trim()
            .toLowerCase();

        // Skip if we already displayed it
        if (seen.has(uniqueName)) {
            return;
        }

        seen.add(uniqueName);


        const result = {

            title: title,

            organization: title,

            description:
                `Learn more about volunteering opportunities with ${title}.`,

            location:
                "New York City",

            url: card.href

        };


        resultsContainer.appendChild(
            createResultCard(
                result,
                resultNumber
            )
        );

        resultNumber++;

    });


    /*
    ==========================================
    SEARCH API
    ==========================================
    */

    const apiResults =
        await getVolunteerData(searchTerm);


    apiResults.forEach(opportunity => {

        const title =
            opportunity.title ||
            opportunity.name ||
            opportunity.opportunity ||
            "Volunteer Opportunity";

        const organization =
            opportunity.organization ||
            opportunity.organization_name ||
            opportunity.org_name ||
            "";


        /*
        Use both the opportunity title and
        organization name to create a unique ID.
        */

        const uniqueName =
            `${organization} ${title}`
                .trim()
                .toLowerCase();


        /*
        Skip duplicate API results.
        */

        if (seen.has(uniqueName)) {
            return;
        }

        seen.add(uniqueName);


        resultsContainer.appendChild(
            createResultCard(
                opportunity,
                resultNumber
            )
        );

        resultNumber++;

    });


    /*
    ==========================================
    NO RESULTS
    ==========================================
    */

    if (seen.size === 0) {

        noResults.classList.add("active");

    } else {

        noResults.classList.remove("active");

    }

}

/*
====================================================
SEARCH INPUT
====================================================
*/

searchInput.onkeydown = event => {

    if (event.key === "Enter") {

        event.preventDefault();

        performSearch(
            searchInput.value
        );

    }

};


/*
====================================================
SEARCH ICON / LIVE SEARCH
====================================================
*/

searchInput.onkeydown = () => {
    if (event.key === "Enter") {
        performSearch(
            searchInput.value
        );

    }

};


/*
====================================================
FILTER MENU
====================================================
*/

function showFilterMenu(
    title,
    description,
    options
) {

    showResultsScreen(
        title,
        description
    );

    filterOptions.innerHTML = "";

    resultsContainer.innerHTML = "";

    noResults.classList.remove("active");

    options.forEach(option => {

        const button =
            document.createElement("button");

        button.className =
            "filter-option";

        button.textContent =
            option.label;

        button.onclick = async () => {

            document
                .querySelectorAll(".filter-option")
                .forEach(button => {
                    button.classList.remove(
                        "selected"
                    );
                });

            button.classList.add(
                "selected"
            );

            await runFilter(
                option.search,
                option.label
            );

        };

        filterOptions.appendChild(
            button
        );

    });

}


/*
====================================================
RUN FILTER
====================================================
*/

async function runFilter(searchTerm, optionLabel) {

    resultsTitle.textContent = optionLabel;

    resultsDescription.textContent =
        `Volunteer opportunities related to ${optionLabel.toLowerCase()}.`;

    resultsContainer.innerHTML = "";

    noResults.classList.remove("active");

    // Keep track of results we have already displayed
    const seen = new Set();

    let resultNumber = 1;


    /*
    ==========================================
    SEARCH LOCAL CARDS
    ==========================================
    */

    const localMatches = localCards.filter(card => {

        const text = card.dataset.search || "";

        return text
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

    });


    localMatches.forEach(card => {

        const image = card.querySelector("img");

        const title =
            image?.alt ||
            "Volunteer Organization";

        // Create a unique name
        const uniqueName =
            title.trim().toLowerCase();

        // Don't display duplicates
        if (seen.has(uniqueName)) {
            return;
        }

        seen.add(uniqueName);


        const result = {

            title: title,

            organization: title,

            description:
                `Explore volunteer opportunities involving ${optionLabel.toLowerCase()}.`,

            location:
                "New York City",

            url: card.href

        };


        resultsContainer.appendChild(
            createResultCard(
                result,
                resultNumber
            )
        );

        resultNumber++;

    });


    /*
    ==========================================
    SEARCH API
    ==========================================
    */

    const apiResults =
        await getVolunteerData(searchTerm);


    apiResults.forEach(opportunity => {

        const title =
            opportunity.title ||
            opportunity.name ||
            opportunity.opportunity ||
            "Volunteer Opportunity";

        const organization =
            opportunity.organization ||
            opportunity.organization_name ||
            opportunity.org_name ||
            "";


        /*
        Combine organization + title.

        This prevents two identical opportunities
        from appearing twice.
        */

        const uniqueName =
            `${organization} ${title}`
                .trim()
                .toLowerCase();


        // Skip duplicate
        if (seen.has(uniqueName)) {
            return;
        }

        seen.add(uniqueName);


        resultsContainer.appendChild(
            createResultCard(
                opportunity,
                resultNumber
            )
        );

        resultNumber++;

    });


    /*
    ==========================================
    NO RESULTS
    ==========================================
    */

    if (seen.size === 0) {

        noResults.classList.add("active");

    } else {

        noResults.classList.remove("active");

    }

}


/*
====================================================
AGE GROUP
====================================================
*/

ageBtn.onclick = event => {

    event.preventDefault();

    showFilterMenu(

        "Age Group",

        "Choose the age group you are looking to volunteer with.",

        [
            {
                label: "Youth",
                search: "youth"
            },

            {
                label: "Teens",
                search: "teen"
            },

            {
                label: "Young Adults",
                search: "young adult"
            },

            {
                label: "Adults",
                search: "adult"
            },

            {
                label: "Seniors",
                search: "senior"
            },

            {
                label: "All Ages",
                search: "all ages"
            }
        ]

    );

};


/*
====================================================
TYPE OF VOLUNTEERING
====================================================
*/

typeBtn.onclick = event => {

    event.preventDefault();

    showFilterMenu(

        "Types of Volunteering",

        "Choose the type of service you are interested in.",

        [
            {
                label: "Food & Hunger",
                search: "food"
            },

            {
                label: "Education",
                search: "education"
            },

            {
                label: "Animals",
                search: "animal"
            },

            {
                label: "Environment",
                search: "environment"
            },

            {
                label: "Homelessness",
                search: "homeless"
            },

            {
                label: "Community Service",
                search: "community"
            },

            {
                label: "Disaster Relief",
                search: "disaster"
            },

            {
                label: "Health",
                search: "health"
            }
        ]

    );

};


/*
====================================================
ELIGIBILITY
====================================================
*/

eligibilityBtn.onclick = event => {

    event.preventDefault();

    showFilterMenu(

        "Eligibility",

        "Find opportunities based on volunteer requirements.",

        [
            {
                label: "No Experience Required",
                search: "no experience"
            },

            {
                label: "Youth Friendly",
                search: "youth"
            },

            {
                label: "Family Friendly",
                search: "family"
            },

            {
                label: "Group Volunteering",
                search: "group"
            },

            {
                label: "Virtual",
                search: "virtual"
            },

            {
                label: "Weekend",
                search: "weekend"
            }
        ]

    );

};


/*
====================================================
LEARN MORE
====================================================
*/

learnBtn.onclick = event => {

    event.preventDefault();

    showResultsScreen(
        "How Volunteering Works",
        "Find an opportunity, learn about the requirements, and get involved."
    );

    filterOptions.innerHTML = "";

    resultsContainer.innerHTML = `

        <article class="result-card">

            <div>

                <span class="result-number">
                    01
                </span>

                <h2>
                    Find an Opportunity
                </h2>

                <p>
                    Search for a volunteer opportunity
                    based on your interests, age group,
                    and availability.
                </p>

            </div>

        </article>


        <article class="result-card">

            <div>

                <span class="result-number">
                    02
                </span>

                <h2>
                    Check the Requirements
                </h2>

                <p>
                    Read the organization's requirements
                    before signing up.
                </p>

            </div>

        </article>


        <article class="result-card">

            <div>

                <span class="result-number">
                    03
                </span>

                <h2>
                    Get Involved
                </h2>

                <p>
                    Contact the organization and begin
                    making a difference in your community.
                </p>

            </div>

        </article>

    `;

};


/*
====================================================
HORIZONTAL SCROLL
====================================================
*/

if (opportunitiesScroll) {

    opportunitiesScroll.onwheel =
        event => {

            if (
                Math.abs(event.deltaY) >
                Math.abs(event.deltaX)
            ) {

                event.preventDefault();

                opportunitiesScroll.scrollLeft -=
                    event.deltaY;

            }

        };

}

/*
====================================================
LOAD USER PROFILE
====================================================
*/

function loadUserProfile() {

    const profileArea =
        document.getElementById("profileArea");

    if (!profileArea) {
        return;
    }


    const accountData =
        localStorage.getItem(
            "volunteerAccount"
        );

    const loggedIn =
        localStorage.getItem(
            "volunteerLoggedIn"
        );


    /*
    If there is no account or the user
    isn't logged in, don't show profile.
    */

    if (!accountData || loggedIn !== "true") {

        profileArea.classList.remove(
            "active"
        );

        return;

    }


    const account =
        JSON.parse(accountData);


    /*
    Display profile.
    */

    profileArea.innerHTML = `

        <img
            class="profile-picture-small"
            src="${account.picture}"
            alt="Profile picture"
        >

        <span class="profile-name">
            ${account.name}
        </span>

        <button
            id="signoutButton"
            class="signout-button"
        >
           SIGN OUT
        </button>

    `;


    profileArea.classList.add(
        "active"
    );


    /*
    Sign out.
    */

    document
        .getElementById("signoutButton")
        .onclick = () => {

            localStorage.setItem(
                "volunteerLoggedIn",
                "false"
            );

            loadUserProfile();

        };

}


/*
====================================================
LOAD PROFILE WHEN PAGE OPENS
====================================================
*/

loadUserProfile();