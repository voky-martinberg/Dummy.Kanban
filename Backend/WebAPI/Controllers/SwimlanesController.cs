using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.Dtos;
using WebAPI.Models;
using WebAPI.Services;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/swimlanes")]
public class SwimlanesController(BoardDbContext db, EventLogClient eventLog) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<SwimlaneDto>> Create(NameRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) return BadRequest("Namn krävs.");

        var position = await db.Swimlanes.CountAsync();
        var swimlane = new Swimlane { Name = request.Name.Trim(), Position = position };
        db.Swimlanes.Add(swimlane);
        await db.SaveChangesAsync();
        await eventLog.LogAsync("swimlane.created", $"Swimlane \"{swimlane.Name}\" skapad", new { swimlane.Id });

        return new SwimlaneDto(swimlane.Id, swimlane.Name, swimlane.Position);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<SwimlaneDto>> Rename(int id, NameRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) return BadRequest("Namn krävs.");

        var swimlane = await db.Swimlanes.FindAsync(id);
        if (swimlane is null) return NotFound();

        var oldName = swimlane.Name;
        swimlane.Name = request.Name.Trim();
        await db.SaveChangesAsync();
        await eventLog.LogAsync("swimlane.renamed", $"Swimlane \"{oldName}\" bytte namn till \"{swimlane.Name}\"", new { swimlane.Id });

        return new SwimlaneDto(swimlane.Id, swimlane.Name, swimlane.Position);
    }

    /// <summary>Sätter ny ordning. Listan ska innehålla alla swimlanes id, i önskad ordning.</summary>
    [HttpPut("order")]
    public async Task<IActionResult> Reorder(ReorderRequest request)
    {
        var swimlanes = await db.Swimlanes.ToListAsync();
        if (!swimlanes.Select(s => s.Id).Order().SequenceEqual(request.Ids.Order()))
            return BadRequest("Listan måste innehålla alla swimlanes exakt en gång.");

        foreach (var swimlane in swimlanes) swimlane.Position = request.Ids.IndexOf(swimlane.Id);
        await db.SaveChangesAsync();
        var order = string.Join(", ", swimlanes.OrderBy(s => s.Position).Select(s => s.Name));
        await eventLog.LogAsync("swimlane.reordered", $"Ny swimlane-ordning: {order}", new { request.Ids });

        return NoContent();
    }

    /// <summary>Tar bort swimlanen och alla uppgifter i den.</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var swimlane = await db.Swimlanes.FindAsync(id);
        if (swimlane is null) return NotFound();

        var taskCount = await db.Tasks.CountAsync(t => t.SwimlaneId == id);
        db.Swimlanes.Remove(swimlane);
        await db.SaveChangesAsync();
        await eventLog.LogAsync("swimlane.deleted", $"Swimlane \"{swimlane.Name}\" borttagen ({taskCount} uppgifter följde med)", new { swimlane.Id });

        var remaining = await db.Swimlanes.OrderBy(s => s.Position).ToListAsync();
        for (var i = 0; i < remaining.Count; i++) remaining[i].Position = i;
        await db.SaveChangesAsync();

        return NoContent();
    }
}
