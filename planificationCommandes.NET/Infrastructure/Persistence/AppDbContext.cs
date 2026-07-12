using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using planificationCommandesBackend.Domain.Entities;

namespace planificationCommandesBackend.Infrastructure.Persistence
{
    // EF Core database context. Registers all entities as DbSets
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Machine> Machines { get; set; }
        public DbSet<Commande> Commandes { get; set; }
        public DbSet<Recette> Recettes { get; set; }
        public DbSet<OperationRecette> OperationsRecette { get; set; }
        public DbSet<Planning> Plannings { get; set; }
        public DbSet<PlanningRow> PlanningRows { get; set; }
        public DbSet<Alert> Alerts { get; set; }

        //the single source of truth for the database schema.
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //  Recette 
            modelBuilder.Entity<Recette>(entity =>
            {
                entity.HasIndex(r => r.NomRecette).IsUnique();

                entity.HasMany(r => r.Operations)
                      .WithOne(o => o.Recette)
                      .HasForeignKey(o => o.RecetteId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            //  OperationRecette 
            modelBuilder.Entity<OperationRecette>(entity =>
            {
                entity.HasIndex(o => new { o.RecetteId, o.Ordre }).IsUnique();
            });

            //  Commande 
            modelBuilder.Entity<Commande>(entity =>
            {
                entity.HasIndex(c => c.NumeroCommande).IsUnique();

                entity.HasOne(c => c.Recette)
                      .WithMany(r => r.Commandes)
                      .HasForeignKey(c => c.RecetteId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            //  Planning 
            modelBuilder.Entity<Planning>(entity =>
            {
                entity.HasMany(p => p.Rows)
                      .WithOne(r => r.Planning)
                      .HasForeignKey(r => r.PlanningId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            //  Alert 
            modelBuilder.Entity<Alert>(entity =>
            {
                entity.HasIndex(a => new { a.Type, a.IsDismissed });
                entity.HasIndex(a => a.GeneratedAt);

                // Alert → Commande (nullable: only Delay alerts have a commande)
                entity.HasOne(a => a.Commande)
                      .WithMany()
                      .HasForeignKey(a => a.CommandeId)
                      .IsRequired(false)
                      // Deleting a commande nullifies related alerts rather than
                      // cascading (alerts are regenerated on next refresh anyway).
                      .OnDelete(DeleteBehavior.SetNull);

                // Alert → Machine (nullable: only Bottleneck alerts have a machine)
                entity.HasOne(a => a.Machine)
                      .WithMany()
                      .HasForeignKey(a => a.MachineId)
                      .IsRequired(false)
                      .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}