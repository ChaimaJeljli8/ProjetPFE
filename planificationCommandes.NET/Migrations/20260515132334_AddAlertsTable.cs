using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace planificationCommandesBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddAlertsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Alerts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Severity = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CommandeId = table.Column<int>(type: "int", nullable: true),
                    NumeroCommande = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DateExport = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DaysRemaining = table.Column<int>(type: "int", nullable: true),
                    Urgence = table.Column<bool>(type: "bit", nullable: true),
                    MachineId = table.Column<int>(type: "int", nullable: true),
                    MachineName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LoadPct = table.Column<double>(type: "float", nullable: true),
                    ScheduledMinutes = table.Column<int>(type: "int", nullable: true),
                    CapaciteMinutes = table.Column<int>(type: "int", nullable: true),
                    BottleneckType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    GeneratedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDismissed = table.Column<bool>(type: "bit", nullable: false),
                    DismissedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alerts", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_GeneratedAt",
                table: "Alerts",
                column: "GeneratedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_Type_IsDismissed",
                table: "Alerts",
                columns: new[] { "Type", "IsDismissed" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Alerts");
        }
    }
}
