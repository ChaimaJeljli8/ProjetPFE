using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace planificationCommandesBackend.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMachineAndDescription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OperationsRecette_Machines_MachineId",
                table: "OperationsRecette");

            migrationBuilder.DropIndex(
                name: "IX_OperationsRecette_MachineId",
                table: "OperationsRecette");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Recettes");

            migrationBuilder.DropColumn(
                name: "MachineId",
                table: "OperationsRecette");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Recettes",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MachineId",
                table: "OperationsRecette",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_OperationsRecette_MachineId",
                table: "OperationsRecette",
                column: "MachineId");

            migrationBuilder.AddForeignKey(
                name: "FK_OperationsRecette_Machines_MachineId",
                table: "OperationsRecette",
                column: "MachineId",
                principalTable: "Machines",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
