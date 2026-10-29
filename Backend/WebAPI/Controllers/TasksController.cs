using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.Dtos;
using WebAPI.Models;
using WebAPI.Services;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController(BoardDbContext db, EventLogClient eventLog) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<TaskDto>> Create(CreateTaskRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title)) return BadRequest("Titel krävs.");
        if (!await CellExists(request.ColumnId, request.SwimlaneId)) return BadRequest("Okänd kolumn eller swimlane.");

        // Nya uppgifter hamnar sist i sin cell.
        var position = await db.Tasks.CountAsync(t => t.ColumnId == request.ColumnId && t.SwimlaneId == request.SwimlaneId);
        var task = new TaskItem
        {
            Title = request.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            ColumnId = request.ColumnId,
            SwimlaneId = request.SwimlaneId,
            Position = position,
        };
        db.Tasks.Add(task);
        await db.SaveChangesAsync();
        await eventLog.LogAsync("task.created", $"Uppgift \"{task.Title}\" skapad i {await CellName(task.ColumnId, task.SwimlaneId)}",
            new { task.Id, task.ColumnId, task.SwimlaneId });

        return ToDto(task);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TaskDto>> Update(int id, UpdateTaskRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title)) return BadRequest("Titel krävs.");

        var task = await db.Tasks.FindAsync(id);
        if (task is null) return NotFound();

        task.Title = request.Title.Trim();
        task.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        await db.SaveChangesAsync();
        await eventLog.LogAsync("task.updated", $"Uppgift \"{task.Title}\" ändrad", new { task.Id });

        return ToDto(task);
    }

    /// <summary>
    /// Flyttar uppgiften till en cell (kolumn × swimlane) och given position i den.
    /// Positionerna i både gamla och nya cellen numreras om så att de förblir 0..n-1.
    /// </summary>
    [HttpPut("{id:int}/move")]
    public async Task<ActionResult<TaskDto>> Move(int id, MoveTaskRequest request)
    {
        var task = await db.Tasks.FindAsync(id);
        if (task is null) return NotFound();
        if (!await CellExists(request.ColumnId, request.SwimlaneId)) return BadRequest("Okänd kolumn eller swimlane.");

        var oldColumnId = task.ColumnId;
        var oldSwimlaneId = task.SwimlaneId;

        var target = await db.Tasks
            .Where(t => t.ColumnId == request.ColumnId && t.SwimlaneId == request.SwimlaneId && t.Id != id)
            .OrderBy(t => t.Position)
            .ToListAsync();
        target.Insert(Math.Clamp(request.Position, 0, target.Count), task);

        task.ColumnId = request.ColumnId;
        task.SwimlaneId = request.SwimlaneId;
        for (var i = 0; i < target.Count; i++) target[i].Position = i;

        if (oldColumnId != request.ColumnId || oldSwimlaneId != request.SwimlaneId)
        {
            var source = await db.Tasks
                .Where(t => t.ColumnId == oldColumnId && t.SwimlaneId == oldSwimlaneId && t.Id != id)
                .OrderBy(t => t.Position)
                .ToListAsync();
            for (var i = 0; i < source.Count; i++) source[i].Position = i;
        }

        await db.SaveChangesAsync();

        var to = await CellName(request.ColumnId, request.SwimlaneId);
        var message = oldColumnId == request.ColumnId && oldSwimlaneId == request.SwimlaneId
            ? $"Uppgift \"{task.Title}\" flyttad inom {to}"
            : $"Uppgift \"{task.Title}\" flyttad från {await CellName(oldColumnId, oldSwimlaneId)} till {to}";
        await eventLog.LogAsync("task.moved", message,
            new { task.Id, FromColumnId = oldColumnId, FromSwimlaneId = oldSwimlaneId, request.ColumnId, request.SwimlaneId, task.Position });

        return ToDto(task);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await db.Tasks.FindAsync(id);
        if (task is null) return NotFound();

        db.Tasks.Remove(task);
        await db.SaveChangesAsync();

        var rest = await db.Tasks
            .Where(t => t.ColumnId == task.ColumnId && t.SwimlaneId == task.SwimlaneId)
            .OrderBy(t => t.Position)
            .ToListAsync();
        for (var i = 0; i < rest.Count; i++) rest[i].Position = i;
        await db.SaveChangesAsync();
        await eventLog.LogAsync("task.deleted", $"Uppgift \"{task.Title}\" borttagen från {await CellName(task.ColumnId, task.SwimlaneId)}",
            new { task.Id });

        return NoContent();
    }

    private async Task<bool> CellExists(int columnId, int swimlaneId) =>
        await db.Columns.AnyAsync(c => c.Id == columnId) && await db.Swimlanes.AnyAsync(s => s.Id == swimlaneId);

    /// <summary>"kolumn / swimlane", för händelseloggens meddelanden.</summary>
    private async Task<string> CellName(int columnId, int swimlaneId)
    {
        var column = await db.Columns.Where(c => c.Id == columnId).Select(c => c.Name).FirstOrDefaultAsync();
        var swimlane = await db.Swimlanes.Where(s => s.Id == swimlaneId).Select(s => s.Name).FirstOrDefaultAsync();
        return $"{column} / {swimlane}";
    }

    private static TaskDto ToDto(TaskItem t) => new(t.Id, t.Title, t.Description, t.ColumnId, t.SwimlaneId, t.Position);
}
