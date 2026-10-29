using Microsoft.AspNetCore.Mvc;
using WebAPI.Services;

namespace WebAPI.Controllers;

/// <summary>
/// Vidarebefordrar läsningar till den interna händelseloggen, som inte nås från internet.
/// </summary>
[ApiController]
[Route("api/events")]
public class EventsController(EventLogClient eventLog) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int limit = 30)
    {
        var events = await eventLog.GetLatestAsync(limit);
        return events is null ? StatusCode(StatusCodes.Status503ServiceUnavailable) : Ok(events);
    }
}
