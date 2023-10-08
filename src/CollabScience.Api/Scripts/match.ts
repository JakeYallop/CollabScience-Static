import matchApi from "./matchApi.js";
import { addMatch, addViewed, getProfileInformation } from "./profile.js";

const tinderContainer = document.querySelector(".tinder")!;
const cardContainer = document.querySelector(".tinder--cards")!;
const allCards = document.querySelectorAll(".tinder--card")!;
const nope = document.getElementById("nope")!;
const love = document.getElementById("love")!;

const profile = getProfileInformation();
if (!profile) {
    console.log(
        "Could not find user profile. Matches may not be very good. Visit the profile page to set your preferences."
    );
}
matchApi
    .matches(
        {
            alreadyViewed: profile?.viewed,
            areasOfInterest: profile?.areasOfInterest,
            equipment: profile?.equipment,
            expertise: profile?.expertise,
        },
        10
    )
    .then(response => {
        return response.json();
    })
    .then(data => {
        data.forEach(project => {
            addCard(project.id, project.name, project.description, project.imageUrl);
        });
    });

function initCards() {
    const newCards = document.querySelectorAll(".tinder--card:not(.removed)") as NodeListOf<HTMLDivElement>;

    newCards.forEach(function (card, index) {
        card.style.zIndex = "" + (allCards.length - index);
        card.style.transform = "scale(" + (20 - index) / 20 + ") translateY(-" + 30 * index + "px)";
        card.style.opacity = "" + (10 - index) / 10;
    });

    tinderContainer.classList.add("loaded");
}

async function cardRemoved(isMatch: boolean, projectId: number) {
    initCards();
    const profile = getProfileInformation();
    if (profile) {
        addViewed(projectId);
        if (isMatch) {
            addMatch(projectId);
        }
    }

    const promise = matchApi.match({
        alreadyViewed: profile?.viewed,
        areasOfInterest: profile?.areasOfInterest,
        expertise: profile?.expertise,
        equipment: profile?.equipment,
    });
    setTimeout(async () => {
        const response = await promise;
        const data = await response.json();
        const info = data[0];
        const removedCards = document.querySelectorAll(".tinder--card.removed") as NodeListOf<HTMLDivElement>;
        removedCards.forEach(card => card.remove());
        addCard(info.id, info.name, info.description, info.imageUrl);
    }, 500);
}

function createButtonListener(love) {
    return function (event) {
        var cards = document.querySelectorAll(".tinder--card:not(.removed)") as NodeListOf<HTMLDivElement>;
        var moveOutWidth = document.body.clientWidth * 1.5;

        if (!cards.length) return false;

        var card = cards[0];

        card.classList.add("removed");

        if (love) {
            card.style.transform = "translate(" + moveOutWidth + "px, -100px) rotate(-30deg)";
        } else {
            card.style.transform = "translate(-" + moveOutWidth + "px, -100px) rotate(30deg)";
        }

        initCards();

        event.preventDefault();
    };
}

function setId(card: HTMLDivElement, id: number) {
    card.setAttribute("data-project-id", id.toString());
}

export function getId(card: HTMLDivElement) {
    return parseInt(card.getAttribute("data-project-id")!);
}
function addCard(id: number, title: string, description: string, imageUrl?: string) {
    const cardHtml = `
        <div class="tinder--card">
            <img src="${imageUrl ?? "../match/ProjectImages/Placeholder.png"}" />
            <h3>${title}</h3>
            <div class="description">
                ${description}
            </div>
        </div>
    `;
    const div = document.createElement("div");
    div.innerHTML = cardHtml;
    const card = div.firstElementChild as HTMLDivElement;
    setId(card, id);
    cardContainer.appendChild(card);

    const matchResut = {
        isMatch: false,
    };

    //@ts-ignore
    var hammertime = new Hammer(card);

    hammertime.on("pan", function () {
        card.classList.add("moving");
    });

    hammertime.on("pan", function (event) {
        if (event.deltaX === 0) return;
        if (event.center.x === 0 && event.center.y === 0) return;

        tinderContainer.classList.toggle("tinder_love", event.deltaX > 0);
        tinderContainer.classList.toggle("tinder_nope", event.deltaX < 0);

        if (event.deltaX > 0) {
            matchResut.isMatch = true;
        } else if (event.deltaX < 0) {
            matchResut.isMatch = false;
        } else {
            matchResut.isMatch = false;
        }

        var xMulti = event.deltaX * 0.03;
        var yMulti = event.deltaY / 80;
        var rotate = xMulti * yMulti;

        event.target.style.transform =
            "translate(" + event.deltaX + "px, " + event.deltaY + "px) rotate(" + rotate + "deg)";
    });

    hammertime.on("panend", function (event) {
        card.classList.remove("moving");
        tinderContainer.classList.remove("tinder_love");
        tinderContainer.classList.remove("tinder_nope");

        var moveOutWidth = document.body.clientWidth;
        var keep = Math.abs(event.deltaX) < 80 || Math.abs(event.velocityX) < 0.5;

        event.target.classList.toggle("removed", !keep);
        if (keep) {
            event.target.style.transform = "";
        } else {
            var endX = Math.max(Math.abs(event.velocityX) * moveOutWidth, moveOutWidth);
            var toX = event.deltaX > 0 ? endX : -endX;
            var endY = Math.abs(event.velocityY) * moveOutWidth;
            var toY = event.deltaY > 0 ? endY : -endY;
            var xMulti = event.deltaX * 0.03;
            var yMulti = event.deltaY / 80;
            var rotate = xMulti * yMulti;

            event.target.style.transform =
                "translate(" + toX + "px, " + (toY + event.deltaY) + "px) rotate(" + rotate + "deg)";

            cardRemoved(matchResut.isMatch, getId(card));
        }
    });

    initCards();
}

const nopeListener = createButtonListener(false);
const loveListener = createButtonListener(true);

nope.addEventListener("click", nopeListener);
love.addEventListener("click", loveListener);
