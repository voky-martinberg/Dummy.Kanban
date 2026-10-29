namespace WebAPI.Models;

/// <summary>En uppgift. Ligger alltid i exakt en cell (kolumn × swimlane).</summary>
public class TaskItem
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }

    /// <summary>Ordning inom cellen (kolumn + swimlane), 0-baserad.</summary>
    public int Position { get; set; }

    public int ColumnId { get; set; }
    public BoardColumn? Column { get; set; }

    public int SwimlaneId { get; set; }
    public Swimlane? Swimlane { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
