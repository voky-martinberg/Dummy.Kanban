using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.Dtos;
using WebAPI.Models;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/swimlanes")]
public class SwimlanesController(BoardDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<SwimlaneDto>> Create(NameRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) return BadRequest("Namn krävs.");

        var position = await db.Swimlanes.CountAsync();
        var swimlane = new Swimlane { Name = request.Name.Trim(), Position = position };
        db.Swimlanes.Add(swimlane);
        await db.SaveChangesAsync();

        return new SwimlaneDto(swimlane.Id, swimlane.Name, swimlane.Position);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<SwimlaneDto>> Rename(int id, NameRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) return BadRequest("Namn krävs.");

        var swimlane = await db.Swimlanes.FindAsync(id);
        if (swimlane is null) return NotFound();

        swimlane.Name = request.Name.Trim();
        await db.SaveChangesAsync();

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

        return NoContent();
    }

    /// <summary>Tar bort swimlanen och alla uppgifter i den.</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var swimlane = await db.Swimlanes.FindAsync(id);
        if (swimlane is null) return NotFound();

        db.Swimlanes.Remove(swimlane);
        await db.SaveChangesAsync();

        var remaining = await db.Swimlanes.OrderBy(s => s.Position).ToListAsync();
        for (var i = 0; i < remaining.Count; i++) remaining[i].Position = i;
        await db.SaveChangesAsync();

        return NoContent();
    }
}
