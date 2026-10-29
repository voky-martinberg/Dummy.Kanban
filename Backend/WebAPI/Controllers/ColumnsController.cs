using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.Dtos;
using WebAPI.Models;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/columns")]
public class ColumnsController(BoardDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ColumnDto>> Create(NameRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) return BadRequest("Namn krävs.");

        var position = await db.Columns.CountAsync();
        var column = new BoardColumn { Name = request.Name.Trim(), Position = position };
        db.Columns.Add(column);
        await db.SaveChangesAsync();

        return new ColumnDto(column.Id, column.Name, column.Position);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ColumnDto>> Rename(int id, NameRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) return BadRequest("Namn krävs.");

        var column = await db.Columns.FindAsync(id);
        if (column is null) return NotFound();

        column.Name = request.Name.Trim();
        await db.SaveChangesAsync();

        return new ColumnDto(column.Id, column.Name, column.Position);
    }

    /// <summary>Sätter ny ordning. Listan ska innehålla alla kolumners id, i önskad ordning.</summary>
    [HttpPut("order")]
    public async Task<IActionResult> Reorder(ReorderRequest request)
    {
        var columns = await db.Columns.ToListAsync();
        if (!columns.Select(c => c.Id).Order().SequenceEqual(request.Ids.Order()))
            return BadRequest("Listan måste innehålla alla kolumner exakt en gång.");

        foreach (var column in columns) column.Position = request.Ids.IndexOf(column.Id);
        await db.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>Tar bort kolumnen och alla uppgifter i den.</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var column = await db.Columns.FindAsync(id);
        if (column is null) return NotFound();

        db.Columns.Remove(column);
        await db.SaveChangesAsync();

        var remaining = await db.Columns.OrderBy(c => c.Position).ToListAsync();
        for (var i = 0; i < remaining.Count; i++) remaining[i].Position = i;
        await db.SaveChangesAsync();

        return NoContent();
    }
}
