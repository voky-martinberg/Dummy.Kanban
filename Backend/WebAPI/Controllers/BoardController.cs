using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.Dtos;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/board")]
public class BoardController(BoardDbContext db) : ControllerBase
{
    /// <summary>Hela tavlan i ett anrop: kolumner, swimlanes och uppgifter.</summary>
    [HttpGet]
    public async Task<BoardDto> Get()
    {
        var columns = await db.Columns.OrderBy(c => c.Position)
            .Select(c => new ColumnDto(c.Id, c.Name, c.Position)).ToListAsync();
        var swimlanes = await db.Swimlanes.OrderBy(s => s.Position)
            .Select(s => new SwimlaneDto(s.Id, s.Name, s.Position)).ToListAsync();
        var tasks = await db.Tasks.OrderBy(t => t.Position)
            .Select(t => new TaskDto(t.Id, t.Title, t.Description, t.ColumnId, t.SwimlaneId, t.Position)).ToListAsync();

        return new BoardDto(columns, swimlanes, tasks);
    }
}
