import { getProfileInformation } from "./profile.js";
import projectsData from "./data.json" assert { type: "json" };

window.addEventListener("DOMContentLoaded", () => {
    const profile = getProfileInformation();
    if (!profile || !profile.matchedWith) {
        document.getElementById("no-profile-message")?.classList.add("shown");
    }
    loadMatches();
});

function loadMatches() {
    const profile = getProfileInformation();
    const matches = Array.isArray(profile?.matchedWith) ? profile!.matchedWith : [];
    const projects = projectsData.filter(x => matches.includes(x.Id));

    if (matches.length === 0) {
        const noMatchesHtml = `
            <h4>No matches found.
            <a href=/match>Go to the match page to find more matches.</a>  You can update your <a href="/profile">profile here</a>
            </h4>
        `;
        document.getElementById("matches")!.innerHTML = noMatchesHtml;
        document.getElementById("go-to-match-page")?.remove();
        return;
    }

    //<th>Image</th>
    // <td><img src="${project.imageUrl}" alt="Project image"></td>
    const matchHtml = `
<table>
<tr>
<th>Project</th>
<th>Description</th>
<th></th>
</tr>
${projects
    .map(
        project => `
        <tr>
        <td>${project.Name}</td>
        <td>${project.Description}</td>
        <td><a href="${project.Url}" target="_blank" >Go to project page</a></td>
        </tr>
        `
    )
    .join("")}
    </table>
    `;
    document.getElementById("matches")!.innerHTML = matchHtml;
}
