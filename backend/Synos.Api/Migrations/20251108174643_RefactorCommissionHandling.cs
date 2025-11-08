using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Synos.Api.Migrations
{
    /// <inheritdoc />
    public partial class RefactorCommissionHandling : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "commission_amount",
                table: "order_items",
                type: "decimal(12,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "commission_rate",
                table: "order_items",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "seller_payout_amount",
                table: "order_items",
                type: "decimal(12,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "commission_amount",
                table: "order_items");

            migrationBuilder.DropColumn(
                name: "commission_rate",
                table: "order_items");

            migrationBuilder.DropColumn(
                name: "seller_payout_amount",
                table: "order_items");
        }
    }
}
