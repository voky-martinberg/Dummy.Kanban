namespace WebAPI.Models;

/// <summary>Vertikal sektion på tavlan, t.ex. "Backlog", "In progress", "Done".</summary>
public class BoardColumn
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public int Position { get; set; }

    public List<TaskItem> Tasks { get; set; } = [];
}
