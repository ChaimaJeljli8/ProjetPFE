using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace planificationCommandesBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddTempsChargementDechargement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TempsChargementMinutes",
                table: "OperationsRecette",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TempsDecharementMinutes",
                table: "OperationsRecette",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TempsChargementMinutes",
                table: "OperationsRecette");

            migrationBuilder.DropColumn(
                name: "TempsDecharementMinutes",
                table: "OperationsRecette");
        }
    }
}
