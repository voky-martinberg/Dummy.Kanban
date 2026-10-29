using Microsoft.EntityFrameworkCore;
using WebAPI.Models;

namespace WebAPI.Data;

public class BoardDbContext(DbContextOptions<BoardDbContext> options) : DbContext(options)
{
    public DbSet<BoardColumn> Columns => Set<BoardColumn>();
    public DbSet<Swimlane> Swimlanes => Set<Swimlane>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BoardColumn>(e =>
        {
            e.ToTable("columns");
            e.Property(c => c.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<Swimlane>(e =>
        {
            e.ToTable("swimlanes");
            e.Property(s => s.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<TaskItem>(e =>
        {
            e.ToTable("tasks");
            e.Property(t => t.Title).HasMaxLength(500);

            // Tas en kolumn eller swimlane bort följer dess uppgifter med.
            e.HasOne(t => t.Column).WithMany(c => c.Tasks)
                .HasForeignKey(t => t.ColumnId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(t => t.Swimlane).WithMany(s => s.Tasks)
                .HasForeignKey(t => t.SwimlaneId).OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(t => new { t.ColumnId, t.SwimlaneId, t.Position });
        });
    }
}
