using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace planificationCommandesBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddCommandesAndRecettes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Recettes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NomRecette = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recettes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Commandes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NumeroCommande = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DateExport = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Urgence = table.Column<int>(type: "int", nullable: false),
                    Quantite = table.Column<int>(type: "int", nullable: false),
                    RecetteId = table.Column<int>(type: "int", nullable: false),
                    Statut = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DateCreation = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateModification = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Commandes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Commandes_Recettes_RecetteId",
                        column: x => x.RecetteId,
                        principalTable: "Recettes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OperationsRecette",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RecetteId = table.Column<int>(type: "int", nullable: false),
                    Ordre = table.Column<int>(type: "int", nullable: false),
                    NomOperation = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MachineId = table.Column<int>(type: "int", nullable: false),
                    DureeMinutes = table.Column<int>(type: "int", nullable: false),
                    QuantiteLot = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperationsRecette", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OperationsRecette_Machines_MachineId",
                        column: x => x.MachineId,
                        principalTable: "Machines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OperationsRecette_Recettes_RecetteId",
                        column: x => x.RecetteId,
                        principalTable: "Recettes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Commandes_NumeroCommande",
                table: "Commandes",
                column: "NumeroCommande",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Commandes_RecetteId",
                table: "Commandes",
                column: "RecetteId");

            migrationBuilder.CreateIndex(
                name: "IX_OperationsRecette_MachineId",
                table: "OperationsRecette",
                column: "MachineId");

            migrationBuilder.CreateIndex(
                name: "IX_OperationsRecette_RecetteId_Ordre",
                table: "OperationsRecette",
                columns: new[] { "RecetteId", "Ordre" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Recettes_NomRecette",
                table: "Recettes",
                column: "NomRecette",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Commandes");

            migrationBuilder.DropTable(
                name: "OperationsRecette");

            migrationBuilder.DropTable(
                name: "Recettes");
        }
    }
}
