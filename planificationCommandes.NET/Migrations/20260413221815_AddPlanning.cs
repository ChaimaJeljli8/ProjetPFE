using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace planificationCommandesBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddPlanning : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Plannings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DateGeneration = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateDebut = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Statut = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MakespanPM = table.Column<int>(type: "int", nullable: false),
                    MakespanDays = table.Column<int>(type: "int", nullable: false),
                    NombreCommandes = table.Column<int>(type: "int", nullable: false),
                    NombreLignes = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Plannings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlanningRows",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlanningId = table.Column<int>(type: "int", nullable: false),
                    NumeroCommande = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Quantite = table.Column<int>(type: "int", nullable: false),
                    RecetteId = table.Column<int>(type: "int", nullable: false),
                    Urgence = table.Column<int>(type: "int", nullable: false),
                    NomOperation = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MachineId = table.Column<int>(type: "int", nullable: false),
                    MachineName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StartPM = table.Column<int>(type: "int", nullable: false),
                    EndPM = table.Column<int>(type: "int", nullable: false),
                    DureeMinutes = table.Column<int>(type: "int", nullable: false),
                    TempsChargementMinutes = table.Column<int>(type: "int", nullable: false),
                    TempsDecharementMinutes = table.Column<int>(type: "int", nullable: false),
                    DureeTotale = table.Column<int>(type: "int", nullable: false),
                    LotSize = table.Column<int>(type: "int", nullable: false),
                    QuantiteLot = table.Column<int>(type: "int", nullable: false),
                    LotIdx = table.Column<int>(type: "int", nullable: false),
                    NbLots = table.Column<int>(type: "int", nullable: false),
                    DateStart = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DateEnd = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DateExport = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanningRows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanningRows_Plannings_PlanningId",
                        column: x => x.PlanningId,
                        principalTable: "Plannings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PlanningRows_PlanningId",
                table: "PlanningRows",
                column: "PlanningId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlanningRows");

            migrationBuilder.DropTable(
                name: "Plannings");
        }
    }
}
