namespace WebAPI.Dtos;

public record ColumnDto(int Id, string Name, int Position);
public record SwimlaneDto(int Id, string Name, int Position);
public record TaskDto(int Id, string Title, string? Description, int ColumnId, int SwimlaneId, int Position);
public record BoardDto(List<ColumnDto> Columns, List<SwimlaneDto> Swimlanes, List<TaskDto> Tasks);

public record NameRequest(string Name);
public record ReorderRequest(List<int> Ids);

public record CreateTaskRequest(string Title, string? Description, int ColumnId, int SwimlaneId);
public record UpdateTaskRequest(string Title, string? Description);

/// <summary>Flytta en uppgift till en cell och placera den på given position (0-baserad).</summary>
public record MoveTaskRequest(int ColumnId, int SwimlaneId, int Position);
