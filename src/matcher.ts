import projectsData from "./data.json";
import { ProfileData } from "./profile.js";

export interface MatchParameters {
    areasOfInterest: string[];
    equipment: string[];
    expertise: string[];
    pendingMatches: number[];
    alreadyViewed: number[];
    alreadyMatched: number[];
}

export interface Project {
    id: number;
    name: string;
    description: string;
    url: string;
    imageUrl: string;
    timeToHelp: string[];
    commitment: string[];
    expertise: string[];
    areasOfResearch: string[];
}

const AreasOfInterestWeight: number = 2;
const ExpertiseWeight: number = 1;

export function buildParametersFromProfile(
    profile: ProfileData | undefined | null,
    pendingMatches?: number[]
): MatchParameters {
    return {
        alreadyViewed: Array.isArray(profile?.viewed) ? profile!.viewed : [],
        areasOfInterest: Array.isArray(profile?.areasOfInterest) ? profile!.areasOfInterest : [],
        expertise: Array.isArray(profile?.expertise) ? profile!.expertise : [],
        equipment: Array.isArray(profile?.equipment) ? profile!.equipment : [],
        alreadyMatched: Array.isArray(profile?.matchedWith) ? profile!.matchedWith : [],
        pendingMatches: Array.isArray(pendingMatches) ? pendingMatches : [],
    };
}

export function getMatches(parameters: MatchParameters, numberOfMatches?: number): Project[] {
    numberOfMatches = numberOfMatches || 1;
    if (!parameters.areasOfInterest && !parameters.equipment && !parameters.expertise) {
        return randomSampleMatcher(projectsData, numberOfMatches);
    }

    if (parameters.alreadyViewed.length == projectsData.length) {
        return [];
    }

    let unseenProjects = projectsData.filter(
        x => !parameters.alreadyViewed.includes(x.Id) && !parameters.pendingMatches.includes(x.Id)
    );

    return unseenProjects
        .sort((a, b) => computeWeightForProject(b, parameters) - computeWeightForProject(a, parameters))
        .slice(0, numberOfMatches)
        .map(convertToProject);
}

function computeWeightForProject(project: (typeof projectsData)[number], parameters: MatchParameters): number {
    let areasOfInterest =
        proportionMatchingInSelections(new Set(project.Area), parameters.areasOfInterest) * AreasOfInterestWeight;
    let expertise = proportionMatchingInSelections(new Set(project.Expertise), parameters.expertise) * ExpertiseWeight;
    let result = areasOfInterest + expertise;
    return result;
}

function proportionMatchingInSelections<T>(pool: Set<T>, selections: T[]): number {
    if (pool.size == 0) {
        return 0;
    }

    let matches = 0;
    for (let selection of selections) {
        if (pool.has(selection)) {
            matches++;
        }
    }

    if (matches == 0) {
        return 0;
    }

    return matches / selections.length;
}

function randomSampleMatcher(projects: typeof projectsData, count: number = 1): Project[] {
    return projects
        .sort(() => Math.random() - 0.5)
        .slice(0, count)
        .map(convertToProject);
}

function convertToProject(project: (typeof projectsData)[number]): Project {
    return {
        id: project.Id,
        name: project.Name,
        description: project.Description,
        url: project.Url,
        imageUrl: project.ImageUrl,
        timeToHelp: project.TimeToHelp,
        commitment: project.Commitment,
        expertise: project.Expertise,
        areasOfResearch: project.Area,
    };
}
