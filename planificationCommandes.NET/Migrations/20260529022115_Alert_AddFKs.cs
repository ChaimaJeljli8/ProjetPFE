using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace planificationCommandesBackend.Migrations
{
    /// <inheritdoc />
    public partial class Alert_AddFKs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateExport",
                table: "Alerts");

            migrationBuilder.DropColumn(
                name: "MachineName",
                table: "Alerts");

            migrationBuilder.DropColumn(
                name: "NumeroCommande",
                table: "Alerts");

            migrationBuilder.DropColumn(
                name: "Urgence",
                table: "Alerts");

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_CommandeId",
                table: "Alerts",
                column: "CommandeId");

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_MachineId",
                table: "Alerts",
                column: "MachineId");

            migrationBuilder.AddForeignKey(
                name: "FK_Alerts_Commandes_CommandeId",
                table: "Alerts",
                column: "CommandeId",
                principalTable: "Commandes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Alerts_Machines_MachineId",
                table: "Alerts",
                column: "MachineId",
                principalTable: "Machines",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Alerts_Commandes_CommandeId",
                table: "Alerts");

            migrationBuilder.DropForeignKey(
                name: "FK_Alerts_Machines_MachineId",
                table: "Alerts");

            migrationBuilder.DropIndex(
                name: "IX_Alerts_CommandeId",
                table: "Alerts");

            migrationBuilder.DropIndex(
                name: "IX_Alerts_MachineId",
                table: "Alerts");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateExport",
                table: "Alerts",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MachineName",
                table: "Alerts",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NumeroCommande",
                table: "Alerts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Urgence",
                table: "Alerts",
                type: "bit",
                nullable: true);
        }
    }
}
