namespace WebAPI.Models;

/// <summary>Horisontell sektion på tavlan.</summary>
public class Swimlane
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public int Position { get; set; }

    public List<TaskItem> Tasks { get; set; } = [];
}
