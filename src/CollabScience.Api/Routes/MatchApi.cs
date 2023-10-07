﻿using CollabScience.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace CollabScience.Api.Routes;

public class MatchParametersData
{
    public string[]? AreasOfInterest { get; init; }
    public string[]? Equipment { get; init; }
    public string[]? Expertise { get; init; }
    public int[]? AlreadyMatched { get; init; }
}

public static class MatchApi
{
    public static RouteGroupBuilder MapMatchApiEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("", (MatchParametersData parameters, MatchingService matchingService) =>
        {
            return matchingService.ComputeMatchAsync(new(
                parameters.AreasOfInterest ?? Array.Empty<string>(),
                parameters.Equipment ?? Array.Empty<string>(),
                parameters.Expertise ?? Array.Empty<string>(),
                parameters.AlreadyMatched ?? Array.Empty<int>()
            ));
        });

        return group;
    }
}
